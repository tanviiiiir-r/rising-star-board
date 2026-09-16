import { RANKING } from "@repo/database";

import { getStripeClient } from "../provider/stripe";

export function assertCheckoutCents(cents: number): number {
	if (!Number.isInteger(cents) || cents <= 0) {
		throw new Error("Checkout amount must be a positive number of cents.");
	}
	if (cents % RANKING.incrementCents !== 0) {
		throw new Error(`Checkout must be in ${RANKING.incrementCents}-cent increments.`);
	}
	return cents;
}

export async function createCreditCheckoutSession(input: {
	userId?: string;
	cents: number;
	origin: string;
	method: "credits" | "points";
	kind?: "credit_topup" | "rank_claim";
	listingId?: string;
}) {
	const cents = assertCheckoutCents(input.cents);
	const stripe = getStripeClient();
	const kind = input.kind ?? "credit_topup";
	const session = await stripe.checkout.sessions.create({
		mode: "payment",
		payment_method_types: ["card"],
		success_url:
			kind === "rank_claim"
				? `${input.origin}/dashboard?claimed=1`
				: `${input.origin}/dashboard?topup=1`,
		cancel_url: `${input.origin}/credits?cents=${cents}&method=${input.method}&canceled=1`,
		line_items: [
			{
				quantity: 1,
				price_data: {
					currency: "usd",
					unit_amount: cents,
					product_data: {
						name: kind === "rank_claim" ? "Bid Ladder rank" : "Bid Ladder credits",
						description: `$${(cents / 100).toFixed(2)}`,
					},
				},
			},
		],
		metadata: {
			user_id: input.userId ?? "",
			cents: String(cents),
			kind,
			listing_id: input.listingId ?? "",
			guest: input.userId ? "0" : "1",
		},
	});

	if (!session.url) {
		throw new Error("Stripe did not return a checkout URL.");
	}

	return { url: session.url, sessionId: session.id };
}
