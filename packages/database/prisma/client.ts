import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";

const prismaClientSingleton = () => {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	let host = "";
	try {
		host = new URL(connectionString.replace(/^postgres(ql)?:/, "http:")).hostname;
	} catch {
		throw new Error("DATABASE_URL is not a valid Postgres URI");
	}

	if (process.env.VERCEL && (host === "127.0.0.1" || host === "localhost")) {
		throw new Error("DATABASE_URL points at localhost; Preview cannot reach Postgres");
	}

	const adapter = new PrismaPg({
		connectionString,
		max: 1,
		connectionTimeoutMillis: 5000,
		idleTimeoutMillis: 10000,
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
