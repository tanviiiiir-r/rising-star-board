import { createFileRoute, redirect, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BoardPagination } from "@/components/board/BoardPagination";
import { BoardTabs } from "@/components/board/BoardTabs";
import { CategoryFilter } from "@/components/board/CategoryFilter";
import { ClaimRankControl } from "@/components/board/ClaimRankControl";
import { LatestActivity } from "@/components/board/LatestActivity";
import { ListingCard } from "@/components/board/ListingCard";
import { TodayRanking } from "@/components/board/TodayRanking";
import { TopTwentyDivider } from "@/components/board/TopTwentyDivider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useBoardRealtime } from "@/hooks/useBoardRealtime";
import { boardQuery, categoriesQuery } from "@/lib/queries";
import { BOARDS, RANKING, utcDateString, type BoardKind, type HomeBoard } from "@/lib/ranking";
import { defaultShareMeta } from "@/lib/share-meta";

type BoardSearch = { category?: string; board?: BoardKind; date?: string; page?: number };

function parseBoard(value: unknown): BoardKind | undefined {
  return typeof value === "string" && (BOARDS as readonly string[]).includes(value)
    ? (value as BoardKind)
    : undefined;
}

function asHomeBoard(board: BoardKind | undefined): HomeBoard {
  return board === "today" ? "today" : "all_time";
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): BoardSearch => {
    const out: BoardSearch = {};
    if (typeof search["category"] === "string") out.category = search["category"];
    const board = parseBoard(search["board"]);
    if (board) out.board = board;
    if (typeof search["date"] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(search["date"])) {
      out.date = search["date"];
    }
    const rawPage = search["page"];
    const page =
      typeof rawPage === "number"
        ? rawPage
        : typeof rawPage === "string" && /^\d+$/.test(rawPage)
          ? Number(rawPage)
          : undefined;
    if (page != null && page >= 2) out.page = Math.floor(page);
    return out;
  },
  beforeLoad: ({ search }) => {
    if (search.board !== "daily") return;
    const today = utcDateString();
    if (search.date && search.date !== today) {
      throw redirect({ to: "/daily/$date", params: { date: search.date } });
    }
    throw redirect({ to: "/daily" });
  },
  loaderDeps: ({ search }) => ({
    category: search.category ?? "all",
    board: asHomeBoard(search.board),
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(boardQuery(deps.category, deps.board)),
      context.queryClient.ensureQueryData(boardQuery(deps.category, "today")),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Bid Ladder" },
      {
        name: "description",
        content: "Claim a rank with real credits. Allocation is the rank.",
      },
      ...defaultShareMeta({
        title: "Bid Ladder",
        description: "Claim a rank with real credits. Allocation is the rank.",
      }),
    ],
  }),
  component: BoardPage,
  errorComponent: BoardError,
  notFoundComponent: () => (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-muted-foreground">
      Nothing on the board yet.
    </div>
  ),
});

function BoardError({ error }: { error: Error }) {
  const router = useRouter();
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto max-w-[80rem] px-4 py-16 text-center sm:px-8" role="alert">
          <h1 className="font-display text-3xl">The board couldn't load</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{error.message}</p>
          <Button className="mt-5" onClick={() => void router.invalidate()}>
            Retry
          </Button>
        </div>
      </main>
    </div>
  );
}

function BoardPage() {
  const { category = "all", board: rawBoard, page: requestedPage } = Route.useSearch();
  const board = asHomeBoard(rawBoard);
  const navigate = useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: listings } = useSuspenseQuery(boardQuery(category, board));
  const { data: todayListings } = useSuspenseQuery(boardQuery(category, "today"));
  useBoardRealtime();

  const [claimCents, setClaimCents] = useState<number | null>(null);
  const pageSize = RANKING.boardPageSize;
  const pageCount = Math.max(1, Math.ceil(listings.length / pageSize));
  const page = Math.min(Math.max(requestedPage ?? 1, 1), pageCount);
  const start = (page - 1) * pageSize;
  const pageListings = listings.slice(start, start + pageSize);
  const pastTopTwenty = listings.some((listing) => (listing.rank ?? 0) > RANKING.topTwenty);

  const setSearch = (next: Partial<BoardSearch>) =>
    navigate({
      to: "/",
      search: (prev) => {
        const filterChanged = next.category !== undefined || next.board !== undefined;
        if (!filterChanged) return { ...prev, ...next };
        const { page: _page, date: _date, ...rest } = prev;
        return { ...rest, ...next };
      },
    });

  function handleClaimRank(cents: number) {
    setClaimCents(cents);
    document.getElementById("claim")?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => document.getElementById("claim-target")?.focus(), 350);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[80rem] px-4 pb-24 pt-6 sm:px-8 sm:pt-8">
          <CategoryFilter
            categories={categories}
            active={category}
            onChange={(slug) => setSearch({ category: slug })}
          />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <BoardTabs active={board} onChange={(next) => setSearch({ board: next })} />
          </div>

          <div id="claim" className="mt-12">
            <ClaimRankControl
              listings={listings}
              categories={categories}
              requestedCents={claimCents}
            />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10">
            <div>
              {pageListings.map((listing, index) => {
                const absoluteIndex = start + index;
                return (
                  <div
                    key={listing.id}
                    className={absoluteIndex > 0 ? "border-t border-border" : undefined}
                  >
                    <ListingCard listing={listing} onClaimRank={handleClaimRank} />
                    {listing.rank === 10 ? <LatestActivity listings={listings} /> : null}
                    {listing.rank === RANKING.topTwenty && pastTopTwenty ? (
                      <TopTwentyDivider />
                    ) : null}
                  </div>
                );
              })}
              {page === 1 && !listings.some((listing) => listing.rank === 10) ? (
                <LatestActivity listings={listings} />
              ) : null}
            </div>
            <div className="hidden lg:block">
              {todayListings.length > 0 ? <TodayRanking listings={todayListings} /> : null}
            </div>
          </div>

          <BoardPagination
            page={page}
            pageSize={pageSize}
            total={listings.length}
            search={{
              ...(category !== "all" ? { category } : {}),
              ...(board !== "all_time" ? { board } : {}),
              ...(page > 1 ? { page } : {}),
            }}
          />

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Credits allocated to a listing determine its rank. Equal allocations are broken by who
            got there first —{" "}
            <Link
              to="/how-ranking-works"
              className="text-foreground underline-offset-2 hover:underline"
            >
              see how ranking works
            </Link>
            .
          </p>
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
