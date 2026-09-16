"use client";

import { orpc } from "@shared/lib/orpc-query-utils";
import type { BoardListing } from "@repo/database/board-types";
import { RANKING } from "@repo/database/ranking";
import { Button } from "@repo/ui";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Eye, Share2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { formatCents } from "../lib/format";
import { MovementBadge } from "./MovementBadge";

function visitorKey() {
	const storageKey = "bidladder_visitor";
	const existing = window.localStorage.getItem(storageKey);
	if (existing) {
		return existing;
	}
	const next = crypto.randomUUID();
	window.localStorage.setItem(storageKey, next);
	return next;
}

export function ListingDetail({
	listing,
	above,
	boardLabel,
}: {
	listing: BoardListing;
	above: BoardListing | null;
	boardLabel: string;
}) {
	const onBoard = listing.isBoardVisible && listing.rank != null;
	const overtakeCents = listing.costToOvertakeCents;
	const resultingRank = listing.rank ?? 1;
	const shortfallCents = Math.max(0, RANKING.minVisibleCents - listing.allocationCents);

	const track = useMutation(orpc.board.trackEvent.mutationOptions());
	const trackEvent = track.mutate;

	useEffect(() => {
		trackEvent({
			listingId: listing.id,
			kind: "view",
			visitorKey: visitorKey(),
		});
	}, [listing.id, trackEvent]);

	async function handleShare() {
		const url = window.location.href;
		try {
			if (navigator.share) {
				await navigator.share({ title: listing.name, url });
			} else {
				await navigator.clipboard.writeText(url);
			}
			trackEvent({
				listingId: listing.id,
				kind: "share",
				visitorKey: visitorKey(),
			});
		} catch {
			// User cancelled share.
		}
	}

	return (
		<main className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
			<Link
				href="/"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Board
			</Link>

			<section className="mt-4 surface-card p-6 sm:p-8">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<span className="rounded-md border-[0.5px] border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
							{listing.categoryName}
						</span>
						<h1 className="mt-3 truncate font-display text-[2rem] leading-tight sm:text-4xl">
							{listing.name}
						</h1>
						<p className="mt-1 text-sm text-muted-foreground">{listing.tagline}</p>
					</div>
					<div className="flex shrink-0 flex-col items-end gap-2">
						<span className="allocation-price text-3xl sm:text-4xl">
							{formatCents(listing.allocationCents)}
						</span>
						<span className="text-[11px] uppercase tracking-wide text-muted-foreground">
							allocated
						</span>
						{onBoard ? (
							<div className="flex items-center gap-2">
								<span className="rank-number text-lg">#{listing.rank}</span>
								<MovementBadge rank={listing.rank} previousRank={listing.previousRank} />
							</div>
						) : null}
					</div>
				</div>

				{onBoard ? (
					<div className="mt-5 rounded-lg bg-muted p-4">
						<p className="text-sm font-medium text-foreground">
							Anyone can take this rank for {formatCents(overtakeCents)} on the {listing.categoryName}{" "}
							board.
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							{boardLabel} board · paying that lands them at #{resultingRank}
							{above ? ` (currently ${above.name} at ${formatCents(above.allocationCents)})` : ""}.
							{listing.rank === 1
								? ` Claiming #1 costs ${formatCents(listing.costToClaimFirstCents)}.`
								: ""}
						</p>
					</div>
				) : (
					<div className="mt-5 rounded-lg bg-muted p-4">
						<p className="text-sm font-medium text-foreground">
							Not on the public {boardLabel} board yet.
						</p>
						<p className="mt-1 text-xs text-muted-foreground">
							A listing appears once its allocation reaches {formatCents(RANKING.minVisibleCents)}
							{shortfallCents > 0 ? ` — ${formatCents(shortfallCents)} to go` : ""}. Claiming #1 on
							this board costs {formatCents(listing.costToClaimFirstCents)}.
						</p>
						<Button asChild size="sm" variant="primary" className="mt-3">
							<Link href="/dashboard">
								<TrendingUp className="size-4" />
								Allocate credits
							</Link>
						</Button>
					</div>
				)}

				<div className="mt-6 flex flex-wrap items-center gap-3">
					<Button asChild variant="outline">
						<a href={listing.url} target="_blank" rel="noopener noreferrer">
							Visit site
							<ExternalLink className="size-4" />
						</a>
					</Button>
					<Button variant="secondary" onClick={() => void handleShare()}>
						<Share2 className="size-4" />
						Share
					</Button>
				</div>
			</section>

			<section className="mt-6 surface-card p-6">
				<h2 className="font-display text-2xl">About</h2>
				<p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
					{listing.description}
				</p>
			</section>

			<div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground/70">
				<span className="inline-flex items-center gap-1">
					<Eye className="size-3" />
					{listing.uniqueViews} unique views
				</span>
				<span className="inline-flex items-center gap-1">
					<Share2 className="size-3" />
					{listing.shares} shares
				</span>
				<span>watch-only — these do not affect rank</span>
			</div>

			<p className="mt-4 text-xs text-muted-foreground">
				Credits allocated to a listing determine its rank —{" "}
				<Link
					href="/how-ranking-works"
					className="text-foreground underline-offset-2 hover:underline"
				>
					how ranking works
				</Link>
				.
			</p>
		</main>
	);
}
