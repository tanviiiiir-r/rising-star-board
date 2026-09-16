import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";

const prismaClientSingleton = () => {
	const connectionString =
		process.env.DATABASE_URL ??
		(process.env.VERCEL
			? "postgresql://postgres:postgres@127.0.0.1:5432/postgres"
			: undefined);

	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	let host = "";
	try {
		host = new URL(connectionString.replace(/^postgres(ql)?:/, "http:")).hostname;
		if (host === "127.0.0.1" || host === "localhost") {
			console.error("DATABASE_URL points at localhost; Preview cannot reach Postgres");
		}
	} catch {
		console.error("DATABASE_URL is not a valid Postgres URI");
	}

	const adapter = new PrismaPg({
		connectionString,
		ssl:
			host.includes("supabase.co") || host.includes("pooler.supabase.com")
				? { rejectUnauthorized: false }
				: undefined,
	});

	return new PrismaClient({ adapter });
};

declare global {
	var prisma: PrismaClient;
}

// oxlint-disable-next-line no-redeclare -- This is a singleton
const prisma = globalThis.prisma || prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
	globalThis.prisma = prisma;
}

export { prisma as db };
