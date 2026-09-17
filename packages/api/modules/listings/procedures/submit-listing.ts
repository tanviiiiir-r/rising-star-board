import { createListing } from "@repo/database";
import { resolveListingPreview } from "@repo/database/listing-image";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const submitListing = protectedProcedure
	.route({
		method: "POST",
		path: "/listings",
		tags: ["Listings"],
		summary: "Submit a listing for review",
	})
	.input(
		z.object({
			name: z.string().trim().min(2).max(60),
			tagline: z.string().trim().min(10).max(120),
			url: z
				.string()
				.trim()
				.max(300)
				.refine((value) => {
					try {
						const parsed = new URL(value);
						return parsed.protocol === "https:" && parsed.hostname.includes(".");
					} catch {
						return false;
					}
				}, "Enter a full https:// URL"),
			description: z.string().trim().min(20).max(1200),
			categoryId: z.string().uuid(),
		}),
	)
	.handler(async ({ input, context }) => {
		const preview = await resolveListingPreview(input.url);
		return createListing({
			ownerId: context.user.id,
			categoryId: input.categoryId,
			name: input.name,
			tagline: input.tagline,
			url: preview?.canonicalUrl ?? input.url,
			description: input.description,
		});
	});
