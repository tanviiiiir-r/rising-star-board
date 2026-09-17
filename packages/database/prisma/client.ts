import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/client";
import { toServerlessPostgresUrl } from "./connection-url";

const prismaClientSingleton = () => {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error("DATABASE_URL is not set");
	}

	const serverlessUrl = toServerlessPostgresUrl(connectionString);

	let host = "";
	try {
		host = new URL(serverlessUrl.replace(/^postgres(ql)?:/, "http:")).hostname;
	} catch {
		throw new Error("DATABASE_URL is not a valid Postgres URI");
	}

	if (process.env.VERCEL && (host === "127.0.0.1" || host === "localhost")) {
		throw new Error("DATABASE_URL points at localhost; Preview cannot reach Postgres");
	}

	const adapter = new PrismaPg({
		connectionString: serverlessUrl,
		max: 3,
		min: 0,
		connectionTimeoutMillis: 15000,
		idleTimeoutMillis: 1000,
		allowExitOnIdle: true,
		ssl:
			host.includes("supabase.co") || host.includes("pooler.supabase.com")
				? { rejectUnauthorized: false }
				: undefined,
	});

	return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
globalForPrisma.prisma = prisma;

export { prisma as db };
