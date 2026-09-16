import { PublicBoard } from "@board/components/PublicBoard";
import {
	getBoardListings,
	listActiveCategories,
	utcDateString,
	type HomeBoard,
} from "@repo/database";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const revalidate = 15;

export const metadata: Metadata = {
	title: { absolute: "Bid Ladder" },
	description: "Claim a rank with real credits. Allocation is the rank.",
};

function asHomeBoard(value?: string): HomeBoard {
	return value === "today" ? "today" : "all_time";
}

function parsePage(value?: string): number {
	if (!value || !/^\d+$/.test(value)) {
		return 1;
	}
	return Math.max(1, Number(value));
}

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ category?: string; board?: string; date?: string; page?: string }>;
}) {
	const params = await searchParams;
	if (params.board === "daily") {
		const today = utcDateString();
		if (params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) && params.date !== today) {
			redirect(`/daily/${params.date}`);
		}
		redirect("/daily");
	}

	const board = asHomeBoard(params.board);
	const category = params.category ?? "all";
	const page = parsePage(params.page);
	const categoryFilter = category === "all" ? undefined : category;

	let listings: Awaited<ReturnType<typeof getBoardListings>> = [];
	let todayListings: Awaited<ReturnType<typeof getBoardListings>> = [];
	let categories: Awaited<ReturnType<typeof listActiveCategories>> = [];
	let loadError: string | null = null;

	try {
		const [boardRows, todayRows, catalog] = await Promise.all([
			getBoardListings({ board, category: categoryFilter }),
			getBoardListings({ board: "today", category: categoryFilter }),
			listActiveCategories(),
		]);
		listings = boardRows;
		todayListings = todayRows;
		categories = catalog;
	} catch (error) {
		console.error("board load failed", error);
		loadError = "The board couldn't load.";
	}

	return (
		<PublicBoard
			listings={listings}
			todayListings={todayListings}
			categories={categories}
			board={board}
			category={category}
			page={page}
			loadError={loadError}
		/>
	);
}
