import { createCreditCheckoutSession } from "@repo/payments";
import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const createCreditCheckout = publicProcedure
	.route({
		method: "POST",
		path: "/payments/credits",
		tags: ["Payments"],
		summary: "Create an ad-hoc credit or rank checkout session",
	})
	.input(
		z.object({
			cents: z.number().int().positive(),
			method: z.enum(["credits", "points"]).default("credits"),
			kind: z.enum(["credit_topup", "rank_claim"]).default("credit_topup"),
			listingId: z.string().uuid().optional(),
			origin: z.string().url(),
		}),
	)
	.handler(async ({ input, context }) => {
		const session = await import("@repo/auth").then((mod) =>
			mod.auth.api.getSession({ headers: context.headers }),
		);

		if (!session?.user) {
			throw new Error("Sign in to buy credits or claim a rank.");
		}

		return createCreditCheckoutSession({
			userId: session?.user.id,
			cents: input.cents,
			origin: input.origin,
			method: input.method,
			kind: input.kind,
			listingId: input.listingId,
		});
	});
