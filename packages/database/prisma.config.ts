import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// `prisma generate` needs a URL in the config. It does not connect.
// Runtime Prisma still requires a real DATABASE_URL.
if (!process.env.DATABASE_URL) {
	process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/postgres";
}

const cliUrl = process.env.DIRECT_URL ? "DIRECT_URL" : "DATABASE_URL";

export default defineConfig({
	schema: "./prisma/schema.prisma",
	datasource: {
		url: env(cliUrl),
	},
});
