"use client";

import type { BoardListing } from "@repo/database/board-types";
import { RANKING, isBoardVisible } from "@repo/database/ranking";
import { cn } from "@repo/ui";
import { Eye, Share2 } from "lucide-react";
import Link from "next/link";

import { formatCents } from "../lib/format";
import { AllocationControl } from "./AllocationControl";
import { MovementBadge } from "./MovementBadge";

interface OwnerListing {
	id: string;
	slug: string;
	name: string;
	tagline: string;
	status: string;
	rejectionReason: string | null;
	allocationCents: number;
	category: { name: string } | null;
	ranking: {
		rank: number;
		previousRank: number | null;
		uniqueViews: number;
		shares: number;
	} | null;
}

export function ClimbPanel({
	listing,
	board,
	availableCents,
}: {
	listing: OwnerListing;
	board: BoardListing[];
	availableCents: number;
}) {
	const allocationCents = listing.allocationCents ?? 0;
	const onBoardRow = board.find((row) => row.id === listing.id) ?? null;
	const rank = onBoardRow?.rank ?? null;
	const onBoard = isBoardVisible(allocationCents) && rank != null;
	const ranking = listing.ranking ?? null;

	return (
		<div className="mt-3 rounded-lg bg-muted p-4">
			{onBoard ? (
				<>
					<div className="flex flex-wrap items-center gap-2">
						<span className="rank-number text-base">You are #{rank}</span>
						<MovementBadge rank={rank} previousRank={onBoardRow?.previousRank ?? null} />
						<span className="text-sm text-muted-foreground">
							{formatCents(allocationCents)} allocated
						</span>
					</div>
					<p className="mt-2 text-sm">
						{rank === 1 ? (
							<>You hold #1. Others must beat your allocation to take it.</>
						) : (
							<>
								Add {formatCents(onBoardRow?.costToOvertakeCents ?? RANKING.incrementCents)} to reach
								#{(rank ?? 2) - 1}.
							</>
						)}
					</p>
				</>
			) : (
				<>
					<p className="text-sm font-semibold">
						Not on the board until you allocate {formatCents(RANKING.minVisibleCents)}
					</p>
					<p className="mt-1 text-sm text-muted-foreground">
						Currently allocated: {formatCents(allocationCents)}.
					</p>
				</>
			)}

			<AllocationControl
				listingId={listing.id}
				allocationCents={allocationCents}
				availableCents={availableCents}
			/>

			<p className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
				<span className="flex items-center gap-1">
					<Eye className="size-3.5" />
					{ranking?.uniqueViews ?? 0}
				</span>
				<span className="flex items-center gap-1">
					<Share2 className="size-3.5" />
					{ranking?.shares ?? 0}
				</span>
				<span>watch-only · never affects rank</span>
				<Link href="/how-ranking-works" className="text-foreground underline-offset-2 hover:underline">
					How ranking works
				</Link>
			</p>
		</div>
	);
}

const statusStyles: Record<string, string> = {
	pending: "bg-muted text-muted-foreground",
	approved: "bg-muted text-foreground",
	rejected: "bg-fall/15 text-fall",
};

export function DashboardListings({
	listings,
	board,
	availableCents,
}: {
	listings: OwnerListing[];
	board: BoardListing[];
	availableCents: number;
}) {
	if (listings.length === 0) {
		return (
			<div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
				You haven't submitted anything yet.
			</div>
		);
	}

	return (
		<div className="mt-6 flex flex-col gap-3">
			{listings.map((listing) => (
				<article key={listing.id} className="surface-card p-5">
					<div className="flex flex-wrap items-center gap-2">
						<h2 className="font-display text-xl">{listing.name}</h2>
						<span
							className={cn(
								"rounded-md px-2 py-0.5 text-[11px] font-medium capitalize",
								statusStyles[listing.status] ?? statusStyles.pending,
							)}
						>
							{listing.status}
						</span>
						<span className="text-[11px] text-muted-foreground">{listing.category?.name}</span>
					</div>
					<p className="mt-1 text-sm text-muted-foreground">{listing.tagline}</p>
					{listing.status === "rejected" && listing.rejectionReason ? (
						<p className="mt-2 text-sm text-fall">Reason: {listing.rejectionReason}</p>
					) : null}
					{listing.status === "approved" ? (
						<>
							<Link
								href={`/l/${listing.slug}`}
								className="mt-2 inline-block text-sm text-foreground underline-offset-2 hover:underline"
							>
								View on the board
							</Link>
							<ClimbPanel listing={listing} board={board} availableCents={availableCents} />
						</>
					) : null}
				</article>
			))}
		</div>
	);
}
