/**
 * Preview and serverless functions cannot hold Supabase session-mode
 * connections. Session pooler (pooler host, port 5432) caps out at
 * pool_size 15 and surfaces EMAXCONNSESSION. Transaction mode on 6543
 * multiplexes those clients.
 *
 * Prisma-engine query params (pgbouncer, connection_limit) are stripped
 * so `pg` does not forward them as GUC settings.
 */
export function toServerlessPostgresUrl(connectionString: string): string {
	const scheme = connectionString.match(/^(postgres(?:ql)?):/i)?.[1] ?? "postgresql";
	let url: URL;
	try {
		url = new URL(connectionString.replace(/^postgres(?:ql)?:/i, "http:"));
	} catch {
		throw new Error("DATABASE_URL is not a valid Postgres URI");
	}

	const isSupabasePooler = url.hostname.includes("pooler.supabase.com");
	if (isSupabasePooler && (url.port === "" || url.port === "5432")) {
		url.port = "6543";
	}

	url.searchParams.delete("pgbouncer");
	url.searchParams.delete("connection_limit");

	return url.toString().replace(/^http:/i, `${scheme}:`);
}

export function isTransientPoolError(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	return /EMAXCONNSESSION|max clients reached|too many clients already|remaining connection slots/i.test(
		message,
	);
}

export async function withPoolRetry<T>(operation: () => Promise<T>): Promise<T> {
	const delaysMs = [200, 600, 1200];
	let attempt = 0;
	for (;;) {
		try {
			return await operation();
		} catch (error) {
			if (!isTransientPoolError(error) || attempt >= delaysMs.length) {
				throw error;
			}
			await new Promise((resolve) => setTimeout(resolve, delaysMs[attempt]));
			attempt += 1;
		}
	}
}
