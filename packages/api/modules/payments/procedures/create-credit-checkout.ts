import { createCreditCheckoutSession } from "@repo/payments";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const createCreditCheckout = protectedProcedure
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
	.handler(async ({ input, context }) =>
		createCreditCheckoutSession({
			userId: context.user.id,
			cents: input.cents,
			origin: input.origin,
			method: input.method,
			kind: input.kind,
			listingId: input.listingId,
		}),
	);
