import { unstable_cache } from "next/cache";
import {
	getBoardListingBySlug,
	getBoardListings,
	getBoardStats,
	getCategoriesOverview,
	getDailyOverview,
	listActiveCategories,
	type BoardKind,
	type HomeBoard,
} from "@repo/database";

const BOARD_CACHE: { revalidate: number; tags: string[] } = {
	revalidate: 15,
	tags: ["board"],
};

export const loadHomeBoard = unstable_cache(
	async (board: HomeBoard, category: string) => {
		const categoryFilter = category === "all" ? undefined : category;
		const [listings, todayListings, categories] = await Promise.all([
			getBoardListings({ board, category: categoryFilter }),
			getBoardListings({ board: "today", category: categoryFilter }),
			listActiveCategories(),
		]);
		return { listings, todayListings, categories };
	},
	["home-board"],
	BOARD_CACHE,
);

export const loadDailyOverview = unstable_cache(
	async () => getDailyOverview(),
	["daily-overview"],
	BOARD_CACHE,
);

export const loadCategoriesOverview = unstable_cache(
	async () => getCategoriesOverview(),
	["categories-overview"],
	BOARD_CACHE,
);

export const loadBoardStats = unstable_cache(async () => getBoardStats(), ["board-stats"], BOARD_CACHE);

export const loadBoardListing = unstable_cache(
	async (slug: string, board: BoardKind) => {
		const [listing, peers] = await Promise.all([
			getBoardListingBySlug(slug, board),
			getBoardListings({ board }),
		]);
		return { listing, peers };
	},
	["board-listing"],
	BOARD_CACHE,
);

export const loadDailyBoard = unstable_cache(
	async (date: string, category?: string) => getBoardListings({ board: "daily", date, category }),
	["daily-board"],
	BOARD_CACHE,
);
