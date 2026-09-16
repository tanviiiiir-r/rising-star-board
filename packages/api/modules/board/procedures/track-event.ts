import { recordListingEvent } from "@repo/database";
import { z } from "zod";

import { publicProcedure } from "../../../orpc/procedures";

export const trackEvent = publicProcedure
	.route({
		method: "POST",
		path: "/board/event",
		tags: ["Board"],
		summary: "Record a unique view or share",
	})
	.input(
		z.object({
			listingId: z.string().uuid(),
			kind: z.enum(["view", "share"]),
			visitorKey: z.string().min(8).max(200),
		}),
	)
	.handler(async ({ input }) => recordListingEvent(input));
