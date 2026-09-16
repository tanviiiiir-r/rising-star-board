import {
	applyCreditTopup,
	approveListingForClaim,
	assertAllocationAmount,
	getListingOwnerAndAllocation,
	setAllocation,
} from "@repo/database";
import { logger } from "@repo/logs";

export interface PaidCreditSession {
	sessionId: string;
	userId?: string | null;
	listingId?: string | null;
	kind?: string | null;
	cents: number;
}

interface CreditTopupResult {
	ok?: boolean;
	idempotent?: boolean;
	ledger_id?: string;
}

function asTopupResult(value: unknown): CreditTopupResult {
	if (value && typeof value === "object") {
		return value as CreditTopupResult;
	}
	return {};
}

/** Credit a paid checkout once. Rank grant runs only on the first delivery. */
export async function applyPaidCreditSession(input: PaidCreditSession): Promise<void> {
	const userId = input.userId?.trim() || "";
	if (!userId || !Number.isInteger(input.cents) || input.cents <= 0) {
		logger.error("Credit checkout paid without a signed-in user_id; ledger not credited");
		return;
	}

	const topup = asTopupResult(
		await applyCreditTopup({
			userId,
			cents: input.cents,
			idempotencyKey: input.sessionId,
		}),
	);

	if (topup.idempotent) {
		return;
	}

	if (input.kind !== "rank_claim" || !input.listingId) {
		return;
	}

	const listing = await getListingOwnerAndAllocation(input.listingId);
	if (listing?.ownerId !== userId) {
		return;
	}

	const nextCents = listing.allocationCents + input.cents;
	const amount = assertAllocationAmount(nextCents);
	if (!amount.ok) {
		logger.error(`Paid rank claim produced an invalid allocation: ${amount.reason}`);
		return;
	}

	await approveListingForClaim(listing.id, userId);
	await setAllocation(listing.id, nextCents, userId);
}
