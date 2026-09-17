import { describe, expect, it } from "vitest";

import {
	isTransientPoolError,
	toServerlessPostgresUrl,
} from "../database/prisma/connection-url";

describe("toServerlessPostgresUrl", () => {
	it("moves the Supabase session pooler onto transaction port 6543", () => {
		const url = toServerlessPostgresUrl(
			"postgresql://postgres.abc:secret@aws-0-us-east-1.pooler.supabase.com:5432/postgres",
		);
		expect(url).toContain("pooler.supabase.com:6543");
		expect(url).not.toContain(":5432");
		expect(url).not.toContain("pgbouncer");
	});

	it("treats a missing port on the pooler host as session mode", () => {
		const url = toServerlessPostgresUrl(
			"postgres://postgres.abc:secret@aws-1-eu-west-1.pooler.supabase.com/postgres?sslmode=require",
		);
		expect(url.startsWith("postgres://")).toBe(true);
		expect(url).toContain(":6543/");
		expect(url).toContain("sslmode=require");
	});

	it("leaves a direct db host and an already-transaction pooler alone", () => {
		expect(
			toServerlessPostgresUrl(
				"postgresql://postgres:secret@db.abc.supabase.co:5432/postgres",
			),
		).toContain("db.abc.supabase.co:5432");
		expect(
			toServerlessPostgresUrl(
				"postgresql://postgres.abc:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
			),
		).toBe(
			"postgresql://postgres.abc:secret@aws-0-us-east-1.pooler.supabase.com:6543/postgres",
		);
	});
});

describe("isTransientPoolError", () => {
	it("matches Supavisor session exhaustion", () => {
		expect(
			isTransientPoolError(
				new Error("(EMAXCONNSESSION) max clients reached in session mode"),
			),
		).toBe(true);
		expect(isTransientPoolError(new Error("timeout exceeded when trying to connect"))).toBe(
			true,
		);
		expect(isTransientPoolError(new Error("relation listings does not exist"))).toBe(false);
	});
});
