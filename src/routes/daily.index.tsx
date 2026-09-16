import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { DailyDayCard } from "@/components/board/DailyDayCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatUtcDateLong } from "@/lib/format";
import { dailyOverviewQuery } from "@/lib/queries";
import { defaultShareMeta } from "@/lib/share-meta";

export const Route = createFileRoute("/daily/")({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(dailyOverviewQuery());
  },
  head: () => ({
    meta: [
      { title: "Daily — Bid Ladder" },
      {
        name: "description",
        content:
          "Each UTC day gets its own board. Rank is what you allocated that day. Today stays live until midnight UTC.",
      },
      ...defaultShareMeta({
        title: "Daily — Bid Ladder",
        description:
          "Each UTC day gets its own board. Rank is what you allocated that day. Today stays live until midnight UTC.",
        path: "/daily",
      }),
    ],
  }),
  component: DailyPage,
});

function DailyPage() {
  const { data } = useSuspenseQuery(dailyOverviewQuery());
  const since =
    data.launchedOn && data.boards.length > 1 ? formatUtcDateLong(data.launchedOn) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-10 sm:px-8">
          <h1 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">Daily</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {since
              ? `Each UTC day since ${since} gets its own board.`
              : "Each UTC day gets its own board."}{" "}
            Rank is what you allocated that day. Today stays live until midnight UTC, then the day
            closes.
          </p>

          <ul className="mt-8 flex flex-col gap-6">
            {data.boards.map((board) => (
              <li key={board.date}>
                <DailyDayCard board={board} />
              </li>
            ))}
          </ul>
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
