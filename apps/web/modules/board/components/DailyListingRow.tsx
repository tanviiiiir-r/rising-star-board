import Link from "next/link";
import type { BoardListing } from "@repo/database/board-types";

import { formatCents } from "../lib/format";
import { ListingLogo } from "./ListingLogo";

function hostname(url: string): string | null {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return null;
	}
}

function timeAgo(iso: string | null): string | null {
	if (!iso) {
		return null;
	}
	const ms = Date.now() - new Date(iso).getTime();
	if (Number.isNaN(ms) || ms < 0) {
		return null;
	}
	const days = Math.floor(ms / 86_400_000);
	if (days >= 1) {
		return `${days}d`;
	}
	const hours = Math.floor(ms / 3_600_000);
	if (hours >= 1) {
		return `${hours}h`;
	}
	return "new";
}

export function DailyListingRow({
	listing,
}: {
	listing: BoardListing;
}) {
	const host = hostname(listing.url);
	const age = timeAgo(listing.approvedAt);

	return (
		<article className="flex gap-3 rounded-xl bg-background/80 px-3 py-3">
			<ListingLogo
				name={listing.name}
				url={listing.url}
				className="mt-0.5 size-8 rounded-full"
			/>
			<div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
				<span className="rank-number text-base leading-none">{listing.rank ?? "—"}</span>
			</div>
			<div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
				<div className="min-w-0">
					<Link
						href={`/l/${listing.slug}`}
						className="line-clamp-2 text-sm font-medium text-foreground hover:underline"
					>
						{listing.name}
						{listing.tagline ? (
							<span className="font-normal text-muted-foreground"> — {listing.tagline}</span>
						) : null}
					</Link>
					<p className="mt-1 truncate text-xs text-muted-foreground">
						{listing.categoryName}
						{age ? ` · ${age}` : null}
						{host ? ` · ${host}` : null}
					</p>
				</div>
				<div className="allocation-price shrink-0 text-lg leading-none">
					{formatCents(listing.allocationCents)}
				</div>
			</div>
		</article>
	);
}
