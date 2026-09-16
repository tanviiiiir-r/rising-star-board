import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { ListingCard } from "@/components/board/ListingCard";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatUtcDateLong } from "@/lib/format";
import { boardQuery } from "@/lib/queries";
import { utcDateString } from "@/lib/ranking";
import { defaultShareMeta } from "@/lib/share-meta";

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const Route = createFileRoute("/daily/$date")({
  beforeLoad: ({ params }) => {
    if (!DATE.test(params.date)) throw notFound();
    if (params.date === utcDateString()) throw redirect({ to: "/", search: { board: "today" } });
  },
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(boardQuery("all", "daily", params.date));
  },
  head: ({ params }) => {
    const label = DATE.test(params.date) ? formatUtcDateLong(params.date) : "Daily";
    return {
      meta: [
        { title: `${label} — Bid Ladder` },
        {
          name: "description",
          content: `Closed UTC day board for ${label}. Rank is what was allocated that day.`,
        },
        ...defaultShareMeta({
          title: `${label} — Bid Ladder`,
          description: `Closed UTC day board for ${label}.`,
          path: `/daily/${params.date}`,
        }),
      ],
    };
  },
  component: DailyDatePage,
});

function DailyDatePage() {
  const { date } = Route.useParams();
  const { data: listings } = useSuspenseQuery(boardQuery("all", "daily", date));
  const label = formatUtcDateLong(date);

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-[80rem] px-4 pb-8 pt-10 sm:px-8">
          <p className="text-sm text-muted-foreground">
            <Link to="/daily" className="hover:text-foreground">
              Daily
            </Link>
            <span aria-hidden> · </span>
            Closed
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-[-0.03em] sm:text-5xl">{label}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This day closed at midnight UTC. Rank is what was allocated that day.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {listings.length === 0 ? (
              <p className="text-sm text-muted-foreground">No ranks were frozen for this day.</p>
            ) : (
              listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            )}
          </div>
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
