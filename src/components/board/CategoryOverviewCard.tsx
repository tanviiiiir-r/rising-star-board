import { Link } from "@tanstack/react-router";

import { CategoryListingRow } from "@/components/board/CategoryListingRow";
import type { CategoryOverview } from "@/lib/board.functions";
import { categoryIcon } from "@/lib/category-icons";
import { formatCents, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

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

export function HottestCategoryCard({
  category,
  hottest = false,
  place,
}: {
  category: CategoryOverview;
  hottest?: boolean;
  place: number;
}) {
  const Icon = categoryIcon(category.slug);
  const leader = category.listings[0];
  const countLabel = `${category.listingCount} ${category.listingCount === 1 ? "listing" : "listings"}`;
  const age = formatRelativeTime(category.lastAllocatedAt);

  return (
    <Link
      to="/"
      search={{ category: category.slug }}
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl p-4 transition-colors",
        hottest ? "primary-wash" : "border border-border bg-background hover:bg-background/80",
      )}
    >
      <div className="flex min-w-0 items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0 opacity-80" />
        <div className="min-w-0">
          {hottest ? (
            <p className="text-[11px] font-medium uppercase tracking-wide text-primary">#1 hottest</p>
          ) : (
            <p className="text-[11px] font-medium text-muted-foreground">#{place}</p>
          )}
          <p className="truncate text-sm font-medium leading-tight">{category.name}</p>
        </div>
      </div>
      <p className="mt-3 flex justify-between gap-2 text-xs text-muted-foreground">
        <span>{countLabel}</span>
        {age ? <span>{age}</span> : null}
      </p>
      {leader ? (
        <div className="mt-3 flex min-w-0 items-center gap-2">
          <ListingInitial name={leader.name} />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
            Leading {leader.name}
          </span>
          <span className="allocation-price shrink-0 text-sm">
            {formatCents(leader.allocationCents)}
          </span>
        </div>
      ) : null}
    </Link>
  );
}

export function CategoryOverviewCard({ category }: { category: CategoryOverview }) {
  const Icon = categoryIcon(category.slug);
  return (
    <Link
      to="/"
      search={{ category: category.slug }}
      className="flex min-w-0 flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-card/80"
    >
      <h2 className="flex items-center gap-2 text-base font-medium tracking-[-0.022em]">
        <Icon className="size-4 shrink-0 opacity-80" />
        <span className="truncate">{category.name}</span>
      </h2>
      {category.listings.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No ranks yet in this category.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2.5">
          {category.listings.map((listing) => (
            <li key={listing.id}>
              <CategoryListingRow listing={listing} />
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
