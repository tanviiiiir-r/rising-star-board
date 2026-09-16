import { Link } from "@tanstack/react-router";
import { useState } from "react";

import { ListingLogo } from "@/components/board/ListingLogo";
import type { BoardListing } from "@/lib/board.functions";
import { formatCents, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLLAPSED = 2;
const EXPANDED = 8;

/**
 * Recent allocations on this board. Real `allocation_set_at` only — never padded.
 */
export function LatestActivity({ listings }: { listings: BoardListing[] }) {
  const [open, setOpen] = useState(false);
  const ordered = listings
    .filter((listing) => listing.allocationSetAt)
    .slice()
    .sort((a, b) => (b.allocationSetAt ?? "").localeCompare(a.allocationSetAt ?? ""));
  const rows = ordered.slice(0, open ? EXPANDED : COLLAPSED);
  const hasMore = ordered.length > 1;

  return (
    <aside aria-label="Latest activity" className="px-3 py-8 sm:px-4">
      <h2 className="flex items-center gap-2 text-sm font-medium">
        <span className="size-1.5 rounded-full bg-primary" />
        Latest activity
      </h2>

      {ordered.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No allocation activity yet.</p>
      ) : (
        <div className="relative mt-3">
          <ul className="flex flex-col gap-2">
            {rows.map((listing, index) => (
              <li key={listing.id} className={cn(!open && index === 1 && hasMore && "opacity-40")}>
                <Link
                  to="/l/$slug"
                  params={{ slug: listing.slug }}
                  className="flex items-start gap-2.5 rounded-2xl bg-card px-3 py-2.5 transition-colors hover:bg-card/80"
                >
                  <ListingLogo
                    name={listing.name}
                    url={listing.url}
                    logoUrl={listing.logoUrl}
                    size="sm"
                    className="size-7 rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {listing.name}
                      {listing.tagline ? ` — ${listing.tagline}` : null}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      at #{listing.rank ?? "—"} · {formatCents(listing.allocationCents)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(listing.allocationSetAt) ?? "just now"}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          {!open && hasMore ? (
            <div className="absolute inset-x-0 bottom-0 flex justify-center bg-gradient-to-t from-background via-background/80 to-transparent pt-10">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground"
              >
                Show more
              </button>
            </div>
          ) : null}
        </div>
      )}
    </aside>
  );
}
