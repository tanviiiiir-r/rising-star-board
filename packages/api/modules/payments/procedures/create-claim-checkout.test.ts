import { call } from "@orpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@repo/auth", () => ({
	auth: {
		api: {
			getSession: vi.fn(),
		},
	},
}));

vi.mock("@repo/database", () => ({
	createListing: vi.fn(),
}));

vi.mock("@repo/database/listing-image", () => ({
	resolveListingPreview: vi.fn(),
}));

vi.mock("@repo/database/listing-target", async () => {
	const actual = await vi.importActual<typeof import("@repo/database/listing-target")>(
		"@repo/database/listing-target",
	);
	return actual;
});

vi.mock("@repo/payments", () => ({
	createCreditCheckoutSession: vi.fn(),
}));

import { auth } from "@repo/auth";
import { createListing } from "@repo/database";
import { resolveListingPreview } from "@repo/database/listing-image";
import { createCreditCheckoutSession } from "@repo/payments";

import { createClaimCheckout } from "./create-claim-checkout";

const ownerId = "11111111-1111-4111-8111-111111111101";
const categoryId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("createClaimCheckout", () => {
	beforeEach(() => {
		vi.mocked(createListing).mockReset();
		vi.mocked(createCreditCheckoutSession).mockReset();
		vi.mocked(resolveListingPreview).mockReset();
		vi.mocked(resolveListingPreview).mockResolvedValue({
			kind: "web",
			canonicalUrl: "https://example.com",
			label: "example.com",
			name: "Example",
			description: "Example site",
			logoUrl: "https://example.com/apple-touch-icon.png",
			hostname: "example.com",
		});
	});

	it("rejects an unauthenticated caller", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

		await expect(
			call(
				createClaimCheckout,
				{
					cents: 1000,
					url: "https://example.com",
					categoryId,
					origin: "https://bid-ladder.lol",
				},
				{ context: { headers: new Headers() } },
			),
		).rejects.toMatchObject({ code: "UNAUTHORIZED" });
		expect(createListing).not.toHaveBeenCalled();
	});

	it("creates a listing and returns a Stripe session", async () => {
		vi.mocked(auth.api.getSession).mockResolvedValue({
			user: { id: ownerId, role: "user" },
			session: { id: "session-1", userId: ownerId },
		} as never);
		vi.mocked(createListing).mockResolvedValue({ id: "listing-1", slug: "example-com" });
		vi.mocked(createCreditCheckoutSession).mockResolvedValue({
			url: "https://checkout.stripe.com/test",
			sessionId: "cs_test_1",
		});

		const result = await call(
			createClaimCheckout,
			{
				cents: 1500,
				url: "https://example.com",
				categoryId,
				name: "Example",
				origin: "https://bid-ladder.lol",
			},
			{ context: { headers: new Headers() } },
		);

		expect(createListing).toHaveBeenCalledWith(
			expect.objectContaining({
				ownerId,
				categoryId,
				url: "https://example.com",
				name: "Example",
			}),
		);
		expect(createCreditCheckoutSession).toHaveBeenCalledWith({
			userId: ownerId,
			cents: 1500,
			origin: "https://bid-ladder.lol",
			method: "credits",
			kind: "rank_claim",
			listingId: "listing-1",
		});
		expect(result).toEqual({
			url: "https://checkout.stripe.com/test",
			sessionId: "cs_test_1",
		});
	});
});
