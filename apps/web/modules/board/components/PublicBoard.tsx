"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BoardListing, CategoryRecord } from "@repo/database/board-types";
import { RANKING, type HomeBoard } from "@repo/database/ranking";
import { Button } from "@repo/ui";

import { homeHref } from "../lib/board-href";
import { useBoardRealtime } from "../hooks/useBoardRealtime";
import { BoardPagination } from "./BoardPagination";
import { BoardTabs } from "./BoardTabs";
import { CategoryFilter } from "./CategoryFilter";
import { ClaimRankControl } from "./ClaimRankControl";
import { LatestActivity } from "./LatestActivity";
import { ListingCard } from "./ListingCard";
import { TodayRanking } from "./TodayRanking";
import { TopTwentyDivider } from "./TopTwentyDivider";

interface PublicBoardProps {
	listings: BoardListing[];
	todayListings: BoardListing[];
	categories: CategoryRecord[];
	board: HomeBoard;
	category: string;
	page: number;
	loadError: string | null;
}

export function PublicBoard({
	listings,
	todayListings,
	categories,
	board,
	category,
	page: requestedPage,
	loadError,
}: PublicBoardProps) {
	const router = useRouter();
	useBoardRealtime();
	const [claimCents, setClaimCents] = useState<number | null>(null);

	const pageSize = RANKING.boardPageSize;
	const pageCount = Math.max(1, Math.ceil(listings.length / pageSize));
	const page = Math.min(Math.max(requestedPage, 1), pageCount);
	const start = (page - 1) * pageSize;
	const pageListings = listings.slice(start, start + pageSize);
	const pastTopTwenty = listings.some((listing) => (listing.rank ?? 0) > RANKING.topTwenty);

	function setSearch(next: { board?: HomeBoard; category?: string; page?: number }) {
		const filterChanged = next.category !== undefined || next.board !== undefined;
		router.push(
			homeHref({
				category: next.category ?? category,
				board: next.board ?? board,
				page: filterChanged ? undefined : next.page,
			}),
		);
	}

	function handleClaimRank(cents: number) {
		setClaimCents(cents);
		document.getElementById("claim")?.scrollIntoView({ behavior: "smooth", block: "center" });
		window.setTimeout(() => document.getElementById("claim-target")?.focus(), 350);
	}

	if (loadError) {
		return (
			<main className="board-grid-bg">
				<div className="mx-auto max-w-[80rem] px-4 py-16 text-center sm:px-8" role="alert">
					<h1 className="font-display text-3xl">The board couldn't load</h1>
					<p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
						This is a loading problem, not an empty board — no listings were lost.
					</p>
					<Button className="mt-5" variant="primary" onClick={() => router.refresh()}>
						Retry
					</Button>
				</div>
			</main>
		);
	}

	return (
		<main className="board-grid-bg">
			<div className="mx-auto w-full max-w-[80rem] px-4 pb-24 pt-6 sm:px-8 sm:pt-8">
				<CategoryFilter
					categories={categories}
					active={category}
					onChange={(slug) => setSearch({ category: slug })}
				/>

				<div className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<BoardTabs active={board} onChange={(next) => setSearch({ board: next })} />
				</div>

				<div id="claim" className="mt-12">
					<ClaimRankControl
						listings={listings}
						categories={categories}
						requestedCents={claimCents}
					/>
				</div>

				<div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10">
					<div>
						{pageListings.map((listing, index) => {
							const absoluteIndex = start + index;
							return (
								<div
									key={listing.id}
									className={absoluteIndex > 0 ? "border-t border-border" : undefined}
								>
									<ListingCard listing={listing} onClaimRank={handleClaimRank} />
									{listing.rank === 10 ? <LatestActivity listings={listings} /> : null}
									{listing.rank === RANKING.topTwenty && pastTopTwenty ? <TopTwentyDivider /> : null}
								</div>
							);
						})}
						{page === 1 && !listings.some((listing) => listing.rank === 10) ? (
							<LatestActivity listings={listings} />
						) : null}
					</div>
					<div className="hidden lg:block">
						{todayListings.length > 0 ? <TodayRanking listings={todayListings} /> : null}
					</div>
				</div>

				<BoardPagination
					page={page}
					pageSize={pageSize}
					total={listings.length}
					search={{
						...(category !== "all" ? { category } : {}),
						...(board !== "all_time" ? { board } : {}),
						...(page > 1 ? { page } : {}),
					}}
				/>

				<p className="mt-8 text-center text-xs text-muted-foreground">
					Credits allocated to a listing determine its rank. Equal allocations are broken by who got
					there first —{" "}
					<Link
						href="/how-ranking-works"
						className="text-foreground underline-offset-2 hover:underline"
					>
						see how ranking works
					</Link>
					.
				</p>
			</div>
		</main>
	);
}
