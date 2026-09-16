import { getBoardListings } from "@repo/database";
import { BOARDS } from "@repo/database";
import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const getBoard = publicProcedure
	.route({
		method: "GET",
		path: "/board",
		tags: ["Board"],
		summary: "List ranked board listings",
	})
	.input(
		z.object({
			category: z.string().optional(),
			board: z.enum(BOARDS).optional(),
			date: z
				.string()
				.regex(/^\d{4}-\d{2}-\d{2}$/)
				.optional(),
		}),
	)
	.handler(async ({ input }) => getBoardListings(input));
