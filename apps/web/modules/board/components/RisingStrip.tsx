import type { BoardListing } from "@repo/database/board-types";
import { getMovement } from "@repo/database/ranking";
import { TrendingUp } from "lucide-react";
import Link from "next/link";

import { MovementBadge } from "./MovementBadge";

const CAP = 5;

export function RisingStrip({ listings }: { listings: BoardListing[] }) {
	const items = listings
		.map((listing) => ({ listing, movement: getMovement(listing.rank, listing.previousRank) }))
		.filter(
			({ movement }) =>
				movement.kind === "new" || (movement.kind === "up" && movement.rising === true),
		)
		.slice(0, CAP);

	if (items.length === 0) {
		return null;
	}

	return (
		<section aria-label="Rising and new listings" className="mt-6">
			<h2 className="flex items-center gap-1.5 text-xs font-medium tracking-[0.01em] text-muted-foreground">
				<TrendingUp className="size-3.5" />
				Rising &amp; new
			</h2>
			<div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
				{items.map(({ listing }) => (
					<Link
						key={listing.id}
						href={`/l/${listing.slug}`}
						className="flex shrink-0 items-center gap-2 rounded-md border-[0.5px] border-border bg-transparent px-3 py-1.5 text-sm transition-colors hover:bg-accent"
					>
						<span className="rank-number text-xs">{listing.rank ?? "—"}</span>
						<span className="max-w-[9rem] truncate font-medium">{listing.name}</span>
						<MovementBadge rank={listing.rank} previousRank={listing.previousRank} />
					</Link>
				))}
			</div>
		</section>
	);
}
