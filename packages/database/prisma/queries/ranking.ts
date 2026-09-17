import { Prisma } from "../generated/client";
import { db } from "../client";

interface RpcRow {
	result: unknown;
}

/**
 * Ranking mutations stay in Postgres. Prisma only forwards to the existing
 * SECURITY DEFINER functions. SET LOCAL ROLE lets the privileged DATABASE_URL
 * satisfy `current_user = 'service_role'` checks without changing rank math.
 */
async function withServiceRoleQuery(sql: Prisma.Sql) {
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SET LOCAL ROLE service_role`;
		const rows = await tx.$queryRaw<RpcRow[]>(sql);
		return rows[0]?.result;
	});
}

export async function setAllocation(listingId: string, newCents: number, actorId: string) {
	return withServiceRoleQuery(Prisma.sql`
		SELECT public.set_allocation(
			${listingId}::uuid,
			${newCents}::integer,
			${actorId}::uuid
		) AS result
	`);
}

export async function recomputeRankings() {
	return withServiceRoleQuery(Prisma.sql`
		SELECT public.recompute_rankings() AS result
	`);
}

export async function applyCreditTopup(input: {
	userId: string;
	cents: number;
	idempotencyKey: string;
}) {
	return withServiceRoleQuery(Prisma.sql`
		SELECT public.apply_credit_topup(
			${input.userId}::uuid,
			${input.cents}::integer,
			${input.idempotencyKey}
		) AS result
	`);
}

export async function adminGrantCredits(input: {
	userId: string;
	cents: number;
	reason?: string | null;
	idempotencyKey?: string | null;
}) {
	return withServiceRoleQuery(Prisma.sql`
		SELECT public.admin_grant_credits(
			${input.userId}::uuid,
			${input.cents}::integer,
			${input.reason ?? null},
			${input.idempotencyKey ?? null}
		) AS result
	`);
}

export async function adminGrantPoints(input: {
	userId: string;
	points: number;
	reason?: string | null;
	idempotencyKey?: string | null;
}) {
	return withServiceRoleQuery(Prisma.sql`
		SELECT public.admin_grant_points(
			${input.userId}::uuid,
			${input.points}::integer,
			${input.reason ?? null},
			${input.idempotencyKey ?? null}
		) AS result
	`);
}

export async function freezeDailyBoard(utcDate?: string) {
	return withServiceRoleQuery(
		utcDate
			? Prisma.sql`SELECT public.freeze_daily_board(${utcDate}::date) AS result`
			: Prisma.sql`SELECT public.freeze_daily_board() AS result`,
	);
}
