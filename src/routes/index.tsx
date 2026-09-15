import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { BoardTabs } from "@/components/board/BoardTabs";
import { CategoryFilter } from "@/components/board/CategoryFilter";
import { ClaimRankControl } from "@/components/board/ClaimRankControl";
import { ListingCard } from "@/components/board/ListingCard";
import { TodayRanking } from "@/components/board/TodayRanking";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBoardRealtime } from "@/hooks/useBoardRealtime";
import { boardQuery, categoriesQuery, dailyArchiveDatesQuery } from "@/lib/queries";
import { BOARDS, utcDateString, type BoardKind } from "@/lib/ranking";
import { defaultShareMeta } from "@/lib/share-meta";

type BoardSearch = { category?: string; board?: BoardKind; date?: string };

function parseBoard(value: unknown): BoardKind | undefined {
  return typeof value === "string" && (BOARDS as readonly string[]).includes(value)
    ? (value as BoardKind)
    : undefined;
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
  loaderDeps: ({ search }) => ({
    category: search.category ?? "all",
    board: search.board ?? ("all_time" as BoardKind),
    date: search.date,
  }),
  loader: async ({ context, deps }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(categoriesQuery()),
      context.queryClient.ensureQueryData(dailyArchiveDatesQuery()),
      context.queryClient.ensureQueryData(boardQuery(deps.category, deps.board, deps.date)),
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
  const { category = "all", board = "all_time", date } = Route.useSearch();
  const navigate = useNavigate();
  const { data: categories } = useSuspenseQuery(categoriesQuery());
  const { data: archiveDates } = useSuspenseQuery(dailyArchiveDatesQuery());
  const { data: listings } = useSuspenseQuery(boardQuery(category, board, date));
  const { data: todayListings } = useSuspenseQuery(boardQuery(category, "today"));
  useBoardRealtime();

  const today = utcDateString();
  const selectedDate = board === "daily" ? (date ?? today) : today;
  const dateOptions = [today, ...archiveDates.filter((d) => d !== today)];
  const archivedDaily = board === "daily" && selectedDate !== today;

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
            {board === "daily" ? (
              <Select value={selectedDate} onValueChange={(value) => setSearch({ date: value })}>
                <SelectTrigger className="h-9 w-[160px] rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {dateOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>

          <div className="mt-12">
            <ClaimRankControl
              listings={listings}
              categories={categories}
              archived={archivedDaily}
            />
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
        </div>
      </main>
    </div>
  );
}
