import { createFileRoute, redirect, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BoardTabs } from "@/components/board/BoardTabs";
import { CategoryFilter } from "@/components/board/CategoryFilter";
import { ClaimRankControl } from "@/components/board/ClaimRankControl";
import { ListingCard } from "@/components/board/ListingCard";
import { TodayRanking } from "@/components/board/TodayRanking";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { useBoardRealtime } from "@/hooks/useBoardRealtime";
import { boardQuery, categoriesQuery } from "@/lib/queries";
import { BOARDS, utcDateString, type BoardKind, type HomeBoard } from "@/lib/ranking";
import { defaultShareMeta } from "@/lib/share-meta";

type BoardSearch = { category?: string; board?: BoardKind; date?: string };

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
  const { category = "all", board: rawBoard } = Route.useSearch();
  const board = asHomeBoard(rawBoard);
  const navigate = useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: listings } = useSuspenseQuery(boardQuery(category, board));
  const { data: todayListings } = useSuspenseQuery(boardQuery(category, "today"));
  useBoardRealtime();

  const setSearch = (next: Partial<BoardSearch>) =>
    navigate({ to: "/", search: (prev) => ({ ...prev, ...next }) });

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
            <ClaimRankControl listings={listings} categories={categories} />
          </div>

          <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-10">
            <div className="flex flex-col gap-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
            <div className="hidden lg:block">
              {todayListings.length > 0 ? <TodayRanking listings={todayListings} /> : null}
            </div>
          </div>

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
