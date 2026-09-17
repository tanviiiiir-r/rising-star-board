import { resolveListingPreview } from "@repo/database/listing-image";
import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const resolveListingPreviewProcedure = publicProcedure
	.route({
		method: "GET",
		path: "/board/listing-preview",
		tags: ["Board"],
		summary: "Resolve name and logo from a product URL or @handle",
	})
	.input(
		z.object({
			raw: z.string().trim().min(1).max(300),
		}),
	)
	.handler(async ({ input }) => resolveListingPreview(input.raw));
