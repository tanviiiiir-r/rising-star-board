import { setAllocation as setAllocationRpc } from "@repo/database";
import { assertAllocationAmount } from "@repo/database";
import { getListingOwnerAndAllocation } from "@repo/database";
import { ORPCError } from "@orpc/client";
import { z } from "zod";

import { protectedProcedure } from "../../../orpc/procedures";

export const setListingAllocation = protectedProcedure
	.route({
		method: "POST",
		path: "/listings/allocation",
		tags: ["Listings"],
		summary: "Set allocation via Postgres RPC",
	})
	.input(
		z.object({
			listingId: z.string().uuid(),
			cents: z.number().int(),
		}),
	)
	.handler(async ({ input, context }) => {
		const amount = assertAllocationAmount(input.cents);
		if (!amount.ok) {
			throw new ORPCError("BAD_REQUEST", { message: amount.reason });
		}

		const listing = await getListingOwnerAndAllocation(input.listingId);
		if (!listing) {
			throw new ORPCError("NOT_FOUND", { message: "listing not found" });
		}
		if (listing.ownerId !== context.user.id && context.user.role !== "admin") {
			throw new ORPCError("FORBIDDEN", { message: "not allowed" });
		}

		return setAllocationRpc(input.listingId, input.cents, context.user.id);
	});
