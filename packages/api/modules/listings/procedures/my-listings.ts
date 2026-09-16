import { listListingsForOwner } from "@repo/database";

import { protectedProcedure } from "../../../orpc/procedures";

export const myListings = protectedProcedure
	.route({
		method: "GET",
		path: "/listings/mine",
		tags: ["Listings"],
		summary: "Listings owned by the current user",
	})
	.handler(async ({ context }) => listListingsForOwner(context.user.id));
