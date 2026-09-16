import { getBoardStats, getCategoriesOverview, listActiveCategories } from "@repo/database";

import { publicProcedure } from "../../../orpc/procedures";

export const getCategories = publicProcedure
	.route({
		method: "GET",
		path: "/board/categories",
		tags: ["Board"],
		summary: "List active categories",
	})
	.handler(async () => listActiveCategories());

export const getCategoriesOverviewProcedure = publicProcedure
	.route({
		method: "GET",
		path: "/board/categories/overview",
		tags: ["Board"],
		summary: "Category cards with hottest and top 3",
	})
	.handler(async () => getCategoriesOverview());

export const getBoardStatsProcedure = publicProcedure
	.route({
		method: "GET",
		path: "/board/stats",
		tags: ["Board"],
		summary: "Honest all-time board totals",
	})
	.handler(async () => getBoardStats());
