import type { BoardKind } from "./ranking";

export type { BoardKind };

export interface BoardListing {
	id: string;
	slug: string;
	name: string;
	tagline: string;
	url: string;
	description: string;
	approvedAt: string | null;
	allocationSetAt: string | null;
	categoryName: string;
	categorySlug: string;
	rank: number | null;
	previousRank: number | null;
	uniqueViews: number;
	shares: number;
	computedAt: string | null;
	allocationCents: number;
	costToOvertakeCents: number;
	costToClaimFirstCents: number;
	board: BoardKind;
	isBoardVisible: boolean;
}

export interface BoardStats {
	listingCount: number;
	allocatedCents: number;
	clicks: number;
	launchedAt: string | null;
}

export interface CategoryRecord {
	id: string;
	slug: string;
	name: string;
}

export interface CategoryOverview {
	id: string;
	slug: string;
	name: string;
	listingCount: number;
	lastAllocatedAt: string | null;
	listings: BoardListing[];
}

export interface DailyBoardPreview {
	date: string;
	live: boolean;
	listingCount: number;
	listings: BoardListing[];
}

export interface DailyOverview {
	launchedOn: string;
	boards: DailyBoardPreview[];
}
