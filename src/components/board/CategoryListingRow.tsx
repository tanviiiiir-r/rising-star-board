import type { BoardListing } from "@/lib/board.functions";
import { formatCents } from "@/lib/format";

function ListingInitial({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium"
    >
      {(name.trim()[0] ?? "?").toUpperCase()}
    </span>
  );
}

export function CategoryListingRow({ listing }: { listing: BoardListing }) {
  const rankLabel = listing.rank != null ? `#${listing.rank}` : "#—";
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="w-6 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {rankLabel}
      </span>
      <ListingInitial name={listing.name} />
      <span className="min-w-0 flex-1 truncate text-sm">{listing.name}</span>
      <span className="allocation-price shrink-0 text-sm">{formatCents(listing.allocationCents)}</span>
    </div>
  );
}
