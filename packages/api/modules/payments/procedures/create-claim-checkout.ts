import { createListing } from "@repo/database";
import { resolveListingPreview } from "@repo/database/listing-image";
import { parseListingTarget } from "@repo/database/listing-target";
import { createCreditCheckoutSession } from "@repo/payments";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const createClaimCheckout = protectedProcedure
	.route({
		method: "POST",
		path: "/payments/claim",
		tags: ["Payments"],
		summary: "Create a listing and open rank checkout",
	})
	.input(
		z.object({
			cents: z.number().int().positive(),
			url: z.string().trim().min(1).max(300),
			categoryId: z.string().uuid(),
			name: z.string().trim().max(60).optional(),
			origin: z.string().url(),
		}),
	)
	.handler(async ({ input, context }) => {
		const target = parseListingTarget(input.url);
		if (!target) {
			throw new ORPCError("BAD_REQUEST", { message: "Enter a product URL or @handle." });
		}

		const preview = await resolveListingPreview(input.url);
		const name = (input.name?.trim() || preview?.name || target.label).slice(0, 60);
		const listing = await createListing({
			ownerId: context.user.id,
			categoryId: input.categoryId,
			name,
			tagline: `Claimed rank for ${target.label}`,
			url: target.canonicalUrl,
			description: preview?.description || `Paid rank claim for ${target.canonicalUrl}.`,
		});

		return createCreditCheckoutSession({
			userId: context.user.id,
			cents: input.cents,
			origin: input.origin,
			method: "credits",
			kind: "rank_claim",
			listingId: listing.id,
		});
	});
