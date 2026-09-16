import { getBoardListingBySlug } from "@repo/database";
import { BOARDS } from "@repo/database";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const getListing = publicProcedure
	.route({
		method: "GET",
		path: "/board/listing",
		tags: ["Board"],
		summary: "Get one approved listing",
	})
	.input(
		z.object({
			slug: z.string(),
			board: z.enum(BOARDS).optional(),
		}),
	)
	.handler(async ({ input }) => {
		const listing = await getBoardListingBySlug(input.slug, input.board ?? "all_time");
		if (!listing) {
			throw new ORPCError("NOT_FOUND");
		}
		return listing;
	});
