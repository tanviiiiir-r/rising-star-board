import { Link } from "@tanstack/react-router";

import { MovementBadge } from "@/components/MovementBadge";
import type { BoardListing } from "@/lib/board.functions";
import { formatCents } from "@/lib/format";

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function timeAgo(iso: string | null): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return null;
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}d`;
  const hours = Math.floor(ms / 3_600_000);
  if (hours >= 1) return `${hours}h`;
  return "new";
}

export function ListingCard({ listing }: { listing: BoardListing }) {
  const host = hostname(listing.url);
  const age = timeAgo(listing.approvedAt);

  return (
    <article className="surface-card flex gap-4 p-4 sm:px-5 sm:py-5">
      <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
        <span className="rank-number text-lg leading-none sm:text-xl">
          {listing.rank ?? "—"}
        </span>
        <MovementBadge rank={listing.rank} previousRank={listing.previousRank} />
      </div>

      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <Link
            to="/l/$slug"
            params={{ slug: listing.slug }}
            className="line-clamp-2 text-base font-medium text-foreground hover:underline"
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

        <div className="allocation-price shrink-0 text-2xl leading-none sm:text-3xl">
          {formatCents(listing.allocationCents)}
        </div>
      </div>
    </article>
  );
}
