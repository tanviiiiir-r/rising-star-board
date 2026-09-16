import { Prisma } from "../generated/client";
import { db } from "../client";
import {
	BOARDS,
	costToClaimFirstCents,
	costToOvertakeCents,
	isBoardVisible,
	utcDateString,
	type BoardKind,
} from "../../ranking";
import type {
	BoardListing,
	BoardStats,
	CategoryOverview,
	CategoryRecord,
	DailyOverview,
} from "../../board-types";

export type { BoardListing, BoardStats, CategoryOverview, CategoryRecord };

interface RankEmbed {
	rank: number;
	previousRank: number | null;
	uniqueViews: number;
	shares: number;
	computedAt: Date | null;
	score: Prisma.Decimal | null;
}

const listingInclude = {
	category: { select: { name: true, slug: true } },
	ranking: true,
	todayRanking: true,
} satisfies Prisma.ListingInclude;

type ListingWithRanks = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

function rankFrom(row: ListingWithRanks, board: BoardKind): RankEmbed | null {
	const embed = board === "today" ? row.todayRanking : row.ranking;
	if (!embed) {
		return null;
	}
	return {
		rank: embed.rank,
		previousRank: embed.previousRank,
		uniqueViews: embed.uniqueViews,
		shares: embed.shares,
		computedAt: embed.computedAt,
		score: embed.score,
	};
}

function allocationFrom(row: ListingWithRanks, board: BoardKind, rank: RankEmbed | null) {
	if (board === "today" && rank?.score != null) {
		return Number(rank.score);
	}
	return row.allocationCents;
}

function toListing(row: ListingWithRanks, board: BoardKind): BoardListing {
	const rank = rankFrom(row, board);
	const allocationCents = allocationFrom(row, board, rank);
	return {
		id: row.id,
		slug: row.slug,
		name: row.name,
		tagline: row.tagline,
		url: row.url,
		description: row.description,
		approvedAt: row.approvedAt?.toISOString() ?? null,
		allocationSetAt: row.allocationSetAt?.toISOString() ?? null,
		categoryName: row.category.name,
		categorySlug: row.category.slug,
		rank: rank?.rank ?? null,
		previousRank: rank?.previousRank ?? null,
		uniqueViews: rank?.uniqueViews ?? 0,
		shares: rank?.shares ?? 0,
		computedAt: rank?.computedAt?.toISOString() ?? null,
		allocationCents,
		costToOvertakeCents: 0,
		costToClaimFirstCents: 0,
		board,
		isBoardVisible: isBoardVisible(allocationCents) && rank != null,
	};
}

function withCosts(listings: BoardListing[]): BoardListing[] {
	const firstAllocation = listings[0]?.allocationCents ?? null;
	return listings.map((row, index) => {
		const above = index > 0 ? listings[index - 1] : undefined;
		return {
			...row,
			costToClaimFirstCents: costToClaimFirstCents(firstAllocation, row.rank === 1),
			costToOvertakeCents: costToOvertakeCents(
				row.allocationCents,
				above?.allocationCents ?? null,
				above?.rank === 1,
			),
		};
	});
}

export async function listActiveCategories(): Promise<CategoryRecord[]> {
	return db.category.findMany({
		where: { status: "active" },
		orderBy: { sortOrder: "asc" },
		select: { id: true, slug: true, name: true },
	});
}

async function loadLiveBoard(
	board: Exclude<BoardKind, "daily">,
	category?: string,
): Promise<BoardListing[]> {
	const rows = await db.listing.findMany({
		where: {
			status: "approved",
			...(category && category !== "all" ? { category: { slug: category } } : {}),
		},
		include: listingInclude,
		take: 400,
	});

	return withCosts(
		rows
			.map((row) => toListing(row, board))
			.filter((row) => row.isBoardVisible)
			.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)),
	);
}

async function loadDailyArchive(date: string, category?: string): Promise<BoardListing[]> {
	const rows = await db.dailyRankSnapshot.findMany({
		where: {
			utcDate: new Date(`${date}T00:00:00.000Z`),
			listing: {
				status: "approved",
				...(category && category !== "all" ? { category: { slug: category } } : {}),
			},
		},
		include: {
			listing: { include: listingInclude },
		},
		orderBy: { rank: "asc" },
		take: 400,
	});

	return withCosts(
		rows.map((row) => ({
			id: row.listing.id,
			slug: row.listing.slug,
			name: row.listing.name,
			tagline: row.listing.tagline,
			url: row.listing.url,
			description: row.listing.description,
			approvedAt: row.listing.approvedAt?.toISOString() ?? null,
			allocationSetAt: row.listing.allocationSetAt?.toISOString() ?? null,
			categoryName: row.listing.category.name,
			categorySlug: row.listing.category.slug,
			rank: row.rank,
			previousRank: null,
			uniqueViews: row.uniqueViews,
			shares: row.shares,
			computedAt: row.frozenAt.toISOString(),
			allocationCents: row.allocationCents,
			costToOvertakeCents: 0,
			costToClaimFirstCents: 0,
			board: "daily" as const,
			isBoardVisible: true,
		})),
	);
}

export async function getDailyArchiveDates(): Promise<string[]> {
	const rows = await db.dailyRankSnapshot.findMany({
		distinct: ["utcDate"],
		orderBy: { utcDate: "desc" },
		select: { utcDate: true },
		take: 60,
	});
	return rows.map((row) => row.utcDate.toISOString().slice(0, 10));
}

export async function getBoardListings(input: {
	category?: string;
	board?: BoardKind;
	date?: string;
}): Promise<BoardListing[]> {
	const board = input.board ?? "all_time";
	if (board === "daily") {
		const date = input.date ?? utcDateString();
		if (date === utcDateString()) {
			return loadLiveBoard("today", input.category);
		}
		return loadDailyArchive(date, input.category);
	}
	return loadLiveBoard(board, input.category);
}

export async function getBoardListingBySlug(
	slug: string,
	board: BoardKind = "all_time",
): Promise<BoardListing | null> {
	const row = await db.listing.findUnique({
		where: { slug },
		include: listingInclude,
	});
	if (!row || row.status !== "approved") {
		return null;
	}
	return toListing(row, board === "daily" ? "all_time" : board);
}

export async function getBoardStats(): Promise<BoardStats> {
	const empty: BoardStats = {
		listingCount: 0,
		allocatedCents: 0,
		clicks: 0,
		launchedAt: null,
	};

	try {
		const rows = await db.listing.findMany({
			where: { status: "approved" },
			select: {
				allocationCents: true,
				approvedAt: true,
				ranking: { select: { rank: true, uniqueViews: true } },
			},
			take: 400,
		});

		let listingCount = 0;
		let allocatedCents = 0;
		let clicks = 0;
		let launchedAt: string | null = null;

		for (const row of rows) {
			if (!isBoardVisible(row.allocationCents) || row.ranking?.rank == null) {
				continue;
			}
			listingCount += 1;
			allocatedCents += row.allocationCents;
			clicks += row.ranking.uniqueViews;
			const approved = row.approvedAt?.toISOString() ?? null;
			if (approved && (!launchedAt || approved < launchedAt)) {
				launchedAt = approved;
			}
		}

		return { listingCount, allocatedCents, clicks, launchedAt };
	} catch {
		return empty;
	}
}

export async function getCategoriesOverview() {
	const [catalog, listings] = await Promise.all([
		listActiveCategories(),
		loadLiveBoard("all_time"),
	]);

	const grouped = new Map<string, BoardListing[]>();
	for (const listing of listings) {
		if (!listing.categorySlug) {
			continue;
		}
		const bucket = grouped.get(listing.categorySlug) ?? [];
		bucket.push(listing);
		grouped.set(listing.categorySlug, bucket);
	}

	const categories: CategoryOverview[] = catalog.map((category) => {
		const rows = grouped.get(category.slug) ?? [];
		const lastAllocatedAt = rows.reduce<string | null>((latest, row) => {
			if (!row.approvedAt) {
				return latest;
			}
			if (!latest || row.approvedAt > latest) {
				return row.approvedAt;
			}
			return latest;
		}, null);
		return {
			id: category.id,
			slug: category.slug,
			name: category.name,
			listingCount: rows.length,
			lastAllocatedAt,
			listings: rows.slice(0, 3).map((row, index) => ({ ...row, rank: index + 1 })),
		};
	});

	const hottest = categories
		.filter((category) => category.listingCount > 0)
		.slice()
		.sort((a, b) => {
			if (b.listingCount !== a.listingCount) {
				return b.listingCount - a.listingCount;
			}
			return (b.lastAllocatedAt ?? "").localeCompare(a.lastAllocatedAt ?? "");
		})
		.slice(0, 3);

	return { hottest, categories };
}

/** Live today plus recent frozen UTC days. Top 3 rows per day — never padded. */
export async function getDailyOverview(): Promise<DailyOverview> {
	const today = utcDateString();
	const archiveDates = await getDailyArchiveDates();
	const dates = [today, ...archiveDates.filter((date) => date !== today)].slice(0, 30);
	const boards = await Promise.all(
		dates.map(async (date) => {
			const listings = date === today ? await loadLiveBoard("today") : await loadDailyArchive(date);
			return {
				date,
				live: date === today,
				listingCount: listings.length,
				listings: listings.slice(0, 3),
			};
		}),
	);
	const launchedOn = dates[dates.length - 1] ?? today;
	return { launchedOn, boards };
}

export async function recordListingEvent(input: {
	listingId: string;
	kind: "view" | "share";
	visitorKey: string;
}) {
	try {
		await db.event.create({
			data: {
				listingId: input.listingId,
				kind: input.kind,
				visitorKey: input.visitorKey,
			},
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
			return { recorded: false };
		}
		throw error;
	}
	return { recorded: true };
}

export { BOARDS };
