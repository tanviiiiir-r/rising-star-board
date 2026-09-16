import { setAllocation as setAllocationRpc } from "@repo/database";
import { assertAllocationAmount } from "@repo/database";
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
	.handler(async ({ input }) => {
		const amount = assertAllocationAmount(input.cents);
		if (!amount.ok) {
			throw new ORPCError("BAD_REQUEST", { message: amount.reason });
		}
		return setAllocationRpc(input.listingId, input.cents);
	});
