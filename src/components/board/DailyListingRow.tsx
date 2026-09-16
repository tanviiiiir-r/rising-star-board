import { Link } from "@tanstack/react-router";

import { ListingLogo } from "@/components/board/ListingLogo";
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

export function DailyListingRow({
  listing,
  date,
}: {
  listing: BoardListing;
  date?: string;
}) {
  const host = hostname(listing.url);
  const age = timeAgo(listing.approvedAt);
  const search =
    listing.board === "daily" && date
      ? { board: "daily" as const, date }
      : { board: listing.board };

  return (
    <article className="flex gap-3 rounded-xl bg-background/80 px-3 py-3">
      <ListingLogo
        name={listing.name}
        url={listing.url}
        logoUrl={listing.logoUrl}
        className="mt-0.5 size-8 rounded-full"
      />
      <div className="flex w-8 shrink-0 flex-col items-center pt-0.5">
        <span className="rank-number text-base leading-none">{listing.rank ?? "—"}</span>
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0">
          <Link
            to="/l/$slug"
            params={{ slug: listing.slug }}
            search={search}
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
        <div className="allocation-price shrink-0 text-lg leading-none">{formatCents(listing.allocationCents)}</div>
      </div>
    </article>
  );
}
