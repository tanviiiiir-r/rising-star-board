import {
	adminGrantCredits,
	adminGrantPoints,
	freezeDailyBoard,
	listAuditLog,
	listReviewQueue,
	recomputeRankings,
	reviewListing,
	setAllocation,
} from "@repo/database";
import { z } from "zod";

import { adminProcedure } from "../../../orpc/procedures";

export const getReviewQueue = adminProcedure
	.route({
		method: "GET",
		path: "/admin/listings",
		tags: ["Administration"],
		summary: "Listing review queue",
	})
	.handler(async () => listReviewQueue());

export const getAuditLog = adminProcedure
	.route({
		method: "GET",
		path: "/admin/audit",
		tags: ["Administration"],
		summary: "Recent admin audit log",
	})
	.handler(async () => listAuditLog());

export const reviewListingProcedure = adminProcedure
	.route({
		method: "POST",
		path: "/admin/listings/review",
		tags: ["Administration"],
		summary: "Approve or reject a listing",
	})
	.input(
		z.object({
			listingId: z.string().uuid(),
			action: z.enum(["approve", "reject"]),
			reason: z.string().trim().max(300).optional(),
		}),
	)
	.handler(async ({ input, context }) => {
		if (input.action === "reject" && !input.reason) {
			throw new Error("A reason is required when rejecting a listing.");
		}
		return reviewListing({
			listingId: input.listingId,
			action: input.action,
			reason: input.reason,
			adminId: context.user.id,
		});
	});

export const recomputeRankingsProcedure = adminProcedure
	.route({
		method: "POST",
		path: "/admin/rankings/recompute",
		tags: ["Administration"],
		summary: "Recompute rankings via SQL",
	})
	.input(z.object({}).optional())
	.handler(async () => recomputeRankings());

export const grantCredits = adminProcedure
	.route({
		method: "POST",
		path: "/admin/credits",
		tags: ["Administration"],
		summary: "Grant wallet credits",
	})
	.input(
		z.object({
			userId: z.string().uuid(),
			cents: z.number().int().positive(),
			reason: z.string().optional(),
		}),
	)
	.handler(async ({ input }) => adminGrantCredits(input));

export const grantPoints = adminProcedure
	.route({
		method: "POST",
		path: "/admin/points",
		tags: ["Administration"],
		summary: "Grant points",
	})
	.input(
		z.object({
			userId: z.string().uuid(),
			points: z.number().int().positive(),
			reason: z.string().optional(),
		}),
	)
	.handler(async ({ input }) => adminGrantPoints(input));

export const adminSetAllocation = adminProcedure
	.route({
		method: "POST",
		path: "/admin/allocation",
		tags: ["Administration"],
		summary: "Set listing allocation",
	})
	.input(
		z.object({
			listingId: z.string().uuid(),
			cents: z.number().int(),
		}),
	)
	.handler(async ({ input }) => setAllocation(input.listingId, input.cents));

export const freezeDaily = adminProcedure
	.route({
		method: "POST",
		path: "/admin/daily/freeze",
		tags: ["Administration"],
		summary: "Freeze yesterday UTC daily board",
	})
	.input(z.object({ utcDate: z.string().optional() }))
	.handler(async ({ input }) => freezeDailyBoard(input.utcDate));
