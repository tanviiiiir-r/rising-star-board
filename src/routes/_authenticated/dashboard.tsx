import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { AllocationControl } from "@/components/listing/AllocationControl";
import { MovementBadge } from "@/components/MovementBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { amIAdmin } from "@/lib/admin.functions";
import { getMyWallet } from "@/lib/allocation.functions";
import type { BoardListing } from "@/lib/board.functions";
import { formatCents, formatPoints } from "@/lib/format";
import { getMyListings } from "@/lib/listings.functions";
import { boardQuery } from "@/lib/queries";
import { isBoardVisible } from "@/lib/ranking";

type MyListing = Awaited<ReturnType<typeof getMyListings>>[number];

type DashboardSearch = { topup?: boolean; converted?: boolean };

export const Route = createFileRoute("/_authenticated/dashboard")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const out: DashboardSearch = {};
    if (search["topup"] === true || search["topup"] === "1" || search["topup"] === "true") {
      out.topup = true;
    }
    if (
      search["converted"] === true ||
      search["converted"] === "1" ||
      search["converted"] === "true"
    ) {
      out.converted = true;
    }
    return out;
  },
  head: () => ({
    meta: [{ title: "Dashboard — Bid Ladder" }],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const navigate = useNavigate();
  const { topup, converted } = Route.useSearch();
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: () => getMyListings(),
  });
  const { data: admin } = useQuery({ queryKey: ["am-i-admin"], queryFn: () => amIAdmin() });
  const { data: wallet } = useQuery({ queryKey: ["my-wallet"], queryFn: () => getMyWallet() });
  const { data: board = [] } = useQuery(boardQuery("all", "all_time"));

  const availableCents = wallet?.availableCents ?? 0;

  useEffect(() => {
    if (!topup && !converted) return;
    toast.success(topup ? "Credits added." : "Points converted.");
    void navigate({ to: "/dashboard", search: {}, replace: true });
  }, [topup, converted, navigate]);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[80rem] px-4 pb-16 pt-8 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              <span className="allocation-price text-base">{formatCents(availableCents)}</span>
              <span className="mx-2">·</span>
              <span>{formatCents(wallet?.committedCents ?? 0)}</span>
              <span className="mx-2">·</span>
              <span>{formatPoints(wallet?.availablePoints ?? 0)}</span>
            </p>
            <div className="flex gap-2">
              {admin?.isAdmin ? (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">Review</Link>
                </Button>
              ) : null}
              <Button asChild size="sm">
                <Link to="/credits/buy" search={{ method: "credits" }}>
                  Buy
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <Link to="/submit">Submit</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            {isLoading ? (
              <div className="surface-card h-24" />
            ) : listings.length === 0 ? (
              <div className="surface-card flex justify-center p-10">
                <Button asChild>
                  <Link to="/submit">Submit</Link>
                </Button>
              </div>
            ) : (
              listings.map((listing) => (
                <ListingRow
                  key={listing.id}
                  listing={listing}
                  board={board}
                  availableCents={availableCents}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ListingRow({
  listing,
  board,
  availableCents,
}: {
  listing: MyListing;
  board: BoardListing[];
  availableCents: number;
}) {
  const allocationCents = listing.allocation_cents ?? 0;
  const onBoardRow = board.find((row) => row.id === listing.id) ?? null;
  const rank = onBoardRow?.rank ?? null;
  const approved = listing.status === "approved";
  const onBoard = approved && isBoardVisible(allocationCents) && rank != null;

  const title = (
    <>
      {listing.name}
      {listing.tagline ? (
        <span className="font-normal text-muted-foreground"> — {listing.tagline}</span>
      ) : null}
    </>
  );

  return (
    <article className="surface-card flex gap-4 p-4 sm:px-5 sm:py-5">
      <div className="flex w-10 shrink-0 flex-col items-center pt-0.5">
        <span className="rank-number text-xl leading-none">{onBoard ? rank : "—"}</span>
        {onBoard ? (
          <MovementBadge rank={rank} previousRank={onBoardRow?.previousRank ?? null} />
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {approved ? (
            <Link
              to="/l/$slug"
              params={{ slug: listing.slug }}
              className="line-clamp-2 text-base font-medium text-foreground hover:underline"
            >
              {title}
            </Link>
          ) : (
            <p className="line-clamp-2 text-base font-medium">{title}</p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {listing.categories?.name}
            {listing.status !== "approved" ? ` · ${listing.status}` : null}
          </p>
          {listing.status === "rejected" && listing.rejection_reason ? (
            <p className="mt-1 text-xs text-fall">{listing.rejection_reason}</p>
          ) : null}
        </div>

        {approved ? (
          <AllocationControl
            listingId={listing.id}
            allocationCents={allocationCents}
            availableCents={availableCents}
          />
        ) : null}
      </div>
    </article>
  );
}
