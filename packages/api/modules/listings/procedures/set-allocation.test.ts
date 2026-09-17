import { call, ORPCError } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/database", () => ({
	assertAllocationAmount: (cents: number) => {
		if (!Number.isInteger(cents) || cents < 0) {
			return { ok: false, reason: "Allocation must be a non-negative integer number of cents." };
		}
		if (cents === 0) {
			return { ok: true };
		}
		if (cents < 1000) {
			return { ok: false, reason: "Minimum allocation is 1000 cents." };
		}
		if (cents % 100 !== 0) {
			return { ok: false, reason: "Allocation must be in 100-cent increments." };
		}
		return { ok: true };
	},
	getListingOwnerAndAllocation: vi.fn(),
	setAllocation: vi.fn(),
}));

import { auth } from "@repo/auth";
import { getListingOwnerAndAllocation, setAllocation } from "@repo/database";

import { setListingAllocation } from "./set-allocation";

const listingId = "22222222-2222-4222-8222-222222222201";
const ownerId = "11111111-1111-4111-8111-111111111101";
const strangerId = "11111111-1111-4111-8111-111111111199";
const adminId = "11111111-1111-4111-8111-111111111100";

function sessionFor(user: { id: string; role: string }) {
	vi.mocked(auth.api.getSession).mockResolvedValue({
		user,
		session: { id: "session-1", userId: user.id },
	} as never);
}

describe("setListingAllocation", () => {
	beforeEach(() => {
		vi.mocked(getListingOwnerAndAllocation).mockReset();
		vi.mocked(setAllocation).mockReset();
		vi.mocked(setAllocation).mockResolvedValue({ ok: true });
	});

	it("lets the owner allocate", async () => {
		sessionFor({ id: ownerId, role: "user" });
		vi.mocked(getListingOwnerAndAllocation).mockResolvedValue({
			id: listingId,
			ownerId,
			allocationCents: 1000,
		});

		const result = await call(
			setListingAllocation,
			{ listingId, cents: 2000 },
			{ context: { headers: new Headers() } },
		);

		expect(result).toEqual({ ok: true });
		expect(setAllocation).toHaveBeenCalledWith(listingId, 2000, ownerId);
	});

	it("rejects a stranger", async () => {
		sessionFor({ id: strangerId, role: "user" });
		vi.mocked(getListingOwnerAndAllocation).mockResolvedValue({
			id: listingId,
			ownerId,
			allocationCents: 1000,
		});

		await expect(
			call(setListingAllocation, { listingId, cents: 2000 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "FORBIDDEN" });
		expect(setAllocation).not.toHaveBeenCalled();
	});

	it("rejects a missing listing", async () => {
		sessionFor({ id: ownerId, role: "user" });
		vi.mocked(getListingOwnerAndAllocation).mockResolvedValue(null);

		await expect(
			call(setListingAllocation, { listingId, cents: 2000 }, { context: { headers: new Headers() } }),
		).rejects.toBeInstanceOf(ORPCError);
		await expect(
			call(setListingAllocation, { listingId, cents: 2000 }, { context: { headers: new Headers() } }),
		).rejects.toMatchObject({ code: "NOT_FOUND" });
		expect(setAllocation).not.toHaveBeenCalled();
	});

	it("lets an admin allocate someone else's listing", async () => {
		sessionFor({ id: adminId, role: "admin" });
		vi.mocked(getListingOwnerAndAllocation).mockResolvedValue({
			id: listingId,
			ownerId,
			allocationCents: 1000,
		});

		await call(
			setListingAllocation,
			{ listingId, cents: 2000 },
			{ context: { headers: new Headers() } },
		);

		expect(setAllocation).toHaveBeenCalledWith(listingId, 2000, adminId);
	});
});
