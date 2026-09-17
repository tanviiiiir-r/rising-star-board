import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/logs", () => ({
	logger: { error: vi.fn(), log: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@repo/database", () => ({
	applyCreditTopup: vi.fn(),
	approveListingForClaim: vi.fn(),
	assertAllocationAmount: (cents: number) =>
		cents >= 1000 && cents % 100 === 0 ? { ok: true } : { ok: false, reason: "invalid" },
	getListingOwnerAndAllocation: vi.fn(),
	setAllocation: vi.fn(),
}));

import {
	applyCreditTopup,
	approveListingForClaim,
	getListingOwnerAndAllocation,
	setAllocation,
} from "@repo/database";

import { applyPaidCreditSession } from "./apply-paid-credit-session";

const sessionId = "cs_test_1";
const userId = "11111111-1111-4111-8111-111111111101";
const listingId = "22222222-2222-4222-8222-222222222201";

describe("applyPaidCreditSession", () => {
	beforeEach(() => {
		vi.mocked(applyCreditTopup).mockReset();
		vi.mocked(approveListingForClaim).mockReset();
		vi.mocked(getListingOwnerAndAllocation).mockReset();
		vi.mocked(setAllocation).mockReset();
	});

	it("credits and allocates on the first delivery", async () => {
		vi.mocked(applyCreditTopup).mockResolvedValue({ ok: true, idempotent: false });
		vi.mocked(getListingOwnerAndAllocation).mockResolvedValue({
			id: listingId,
			ownerId: userId,
			allocationCents: 0,
		});

		await applyPaidCreditSession({
			sessionId,
			userId,
			listingId,
			kind: "rank_claim",
			cents: 1000,
		});

		expect(applyCreditTopup).toHaveBeenCalledWith({
			userId,
			cents: 1000,
			idempotencyKey: sessionId,
		});
		expect(approveListingForClaim).toHaveBeenCalledWith(listingId, userId);
		expect(setAllocation).toHaveBeenCalledWith(listingId, 1000, userId);
	});

	it("does not allocate again when the ledger is idempotent", async () => {
		vi.mocked(applyCreditTopup).mockResolvedValue({ ok: true, idempotent: true });

		await applyPaidCreditSession({
			sessionId,
			userId,
			listingId,
			kind: "rank_claim",
			cents: 1000,
		});

		expect(setAllocation).not.toHaveBeenCalled();
		expect(getListingOwnerAndAllocation).not.toHaveBeenCalled();
	});

	it("returns without crediting when user_id is missing", async () => {
		await applyPaidCreditSession({
			sessionId,
			userId: "",
			listingId,
			kind: "rank_claim",
			cents: 1000,
		});

		expect(applyCreditTopup).not.toHaveBeenCalled();
		expect(setAllocation).not.toHaveBeenCalled();
	});

	it("rethrows a database failure so the webhook can return 500", async () => {
		vi.mocked(applyCreditTopup).mockRejectedValue(new Error("db down"));

		await expect(
			applyPaidCreditSession({
				sessionId,
				userId,
				listingId,
				kind: "rank_claim",
				cents: 1000,
			}),
		).rejects.toThrow("db down");
		expect(setAllocation).not.toHaveBeenCalled();
	});
});
