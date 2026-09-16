import type { BoardListing } from "@repo/database/board-types";
import { costToClaimRankCents } from "@repo/database/ranking";
import { MousePointerClick, Share2 } from "lucide-react";
import Link from "next/link";

import { categoryIcon } from "../lib/category-icons";
import { homeHref } from "../lib/board-href";
import { formatCents, formatCount, formatExactTime, formatRelativeTime } from "../lib/format";
import { ListingLogo } from "./ListingLogo";
import { MovementBadge } from "./MovementBadge";

function hostname(url: string): string | null {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

export function ListingCard({
	listing,
	archived = false,
	onClaimRank,
}: {
	listing: BoardListing;
	archived?: boolean;
	onClaimRank?: (cents: number) => void;
}) {
	const host = hostname(listing.url);
	const age = formatRelativeTime(listing.approvedAt);
	const exactTime = formatExactTime(listing.approvedAt);
	const CategoryIcon = categoryIcon(listing.categorySlug);
	const rankLabel = listing.rank != null ? `#${listing.rank}` : "#—";
	const description = listing.description.startsWith("[SEED]") ? "" : listing.description;
	const claimCents = costToClaimRankCents(listing.allocationCents, listing.rank === 1);
	const showClaim = !archived && Boolean(onClaimRank) && listing.rank != null;

	return (
		<article className="group relative rounded-2xl px-3 py-4 transition-colors hover:bg-card sm:px-4">
			<div className="flex items-start gap-3 sm:gap-4">
				<ListingLogo name={listing.name} url={listing.url} className="mt-0.5 size-11 rounded-full" />

				<div className="min-w-0 flex-1">
					<div className="flex items-start justify-between gap-4">
						<div className="min-w-0">
							<Link
								href={`/l/${listing.slug}`}
								className="text-[15px] font-medium leading-snug tracking-[-0.011em] hover:underline"
							>
								<span className="mr-1.5 font-mono tabular-nums text-muted-foreground transition-colors group-hover:text-primary">
									{rankLabel}
								</span>
								<span className="text-foreground">
									{listing.name}
									{listing.tagline ? ` - ${listing.tagline}` : null}
								</span>
							</Link>
							<MovementBadge
								compact
								rank={listing.rank}
								previousRank={listing.previousRank}
								className="ml-1.5 inline-flex align-middle"
							/>
						</div>
						<div className="allocation-price shrink-0 pt-0.5 text-xl leading-none sm:text-2xl">
							{formatCents(listing.allocationCents)}
						</div>
					</div>

					{description ? (
						<p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{description}</p>
					) : null}

					<p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
						{listing.categorySlug ? (
							<Link
								href={homeHref({ category: listing.categorySlug })}
								className="inline-flex items-center gap-1 hover:text-foreground"
							>
								<CategoryIcon className="size-3 shrink-0 opacity-80" />
								{listing.categoryName}
							</Link>
						) : (
							<span className="inline-flex items-center gap-1">
								<CategoryIcon className="size-3 shrink-0 opacity-80" />
								{listing.categoryName}
							</span>
						)}
						{age ? (
							<>
								<span aria-hidden>·</span>
								{exactTime ? (
									<span className="relative inline-flex">
										<time
											dateTime={listing.approvedAt ?? undefined}
											className="peer cursor-default"
											aria-label={`${age}, ${exactTime}`}
										>
											{age}
										</time>
										<span
											aria-hidden
											className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[11px] text-popover-foreground opacity-0 shadow-sm transition-opacity peer-hover:opacity-100"
										>
											{exactTime}
										</span>
									</span>
								) : (
									<span>{age}</span>
								)}
							</>
						) : null}
						{host ? (
							<>
								<span aria-hidden>·</span>
								<span>{host}</span>
							</>
						) : null}
						<span aria-hidden>·</span>
						<span
							className="inline-flex items-center gap-1"
							aria-label={`${formatCount(listing.uniqueViews)} ${listing.uniqueViews === 1 ? "click" : "clicks"}`}
						>
							<MousePointerClick className="size-3 shrink-0 opacity-80" aria-hidden />
							{formatCount(listing.uniqueViews)}
						</span>
						<span aria-hidden>·</span>
						<span
							className="inline-flex items-center gap-1"
							aria-label={`${formatCount(listing.shares)} ${listing.shares === 1 ? "share" : "shares"}`}
						>
							<Share2 className="size-3 shrink-0 opacity-80" aria-hidden />
							{formatCount(listing.shares)}
						</span>
						<span aria-hidden>·</span>
						<Link href={`/l/${listing.slug}`} className="hover:text-foreground">
							see details
						</Link>
					</p>
				</div>
			</div>

			{showClaim ? (
				<button
					type="button"
					onClick={() => onClaimRank?.(claimCents)}
					className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100"
				>
					<span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-sm sm:text-sm">
						claim this rank for {formatCents(claimCents)}
					</span>
				</button>
			) : null}
		</article>
	);
}
