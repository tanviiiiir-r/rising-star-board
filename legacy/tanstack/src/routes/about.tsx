import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCents, formatCount } from "@/lib/format";
import { boardQuery, boardStatsQuery } from "@/lib/queries";
import { publicSiteUrl } from "@/lib/site-url";
import { cn } from "@/lib/utils";

function aboutPageUrl() {
  const origin = publicSiteUrl();
  return origin ? `${origin}/about` : "/about";
}

export const Route = createFileRoute("/about")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(boardStatsQuery()),
      context.queryClient.ensureQueryData(boardQuery("all", "all_time")),
      context.queryClient.ensureQueryData(boardQuery("all", "today")),
    ]);
  },
  head: () => ({
    meta: [
      { title: "About — Bid Ladder" },
      {
        name: "description",
        content:
          "Bid Ladder is a public allocation board. Rank is what you allocated — nothing else. No ads, no API keys, no revenue sharing.",
      },
      { property: "og:title", content: "About — Bid Ladder" },
      {
        property: "og:description",
        content:
          "Bid Ladder is a public allocation board. Rank is what you allocated — nothing else.",
      },
      { property: "og:type", content: "article" },
      { property: "og:url", content: aboutPageUrl() },
    ],
    links: [{ rel: "canonical", href: aboutPageUrl() }],
  }),
  component: AboutPage,
});

function formatApprovedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const statTileClass = "rounded-2xl bg-card px-5 py-6 transition-colors";

function StatTile({
  value,
  label,
  accent = false,
}: {
  value: string;
  label: string;
  accent?: boolean;
}) {
  return (
    <>
      <p className="flex items-center gap-2 font-display text-2xl tabular-nums tracking-tight sm:text-3xl">
        {accent ? <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
        <span className={cn(!accent && value.startsWith("$") && "allocation-price")}>{value}</span>
      </p>
      <p className="mt-2 truncate text-sm text-muted-foreground">{label}</p>
    </>
  );
}

function AboutPage() {
  const { data: stats } = useSuspenseQuery(boardStatsQuery());
  const { data: allTime } = useSuspenseQuery(boardQuery("all", "all_time"));
  const { data: today } = useSuspenseQuery(boardQuery("all", "today"));
  const highest = allTime[0] ?? null;
  const todayAllocated = today.reduce((sum, listing) => sum + listing.allocationCents, 0);
  const launched = stats.launchedAt ? formatApprovedAt(stats.launchedAt) : null;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="board-grid-bg">
        <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-10 sm:px-8">
          <h1 className="font-display text-4xl tracking-[-0.03em] sm:text-5xl">About</h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Bid Ladder started as a{" "}
            <span className="text-primary">simple side project</span>: no ads, no API keys, no
            revenue sharing. Just claim a rank — that's it.
          </p>

          <section className="mt-10">
            <h2 className="text-lg font-medium tracking-[-0.022em]">On the board</h2>
            {launched ? (
              <p className="mt-2 text-sm text-muted-foreground">
                The first listing was approved on {launched}.
              </p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                These numbers are the live board — unique views, allocations, and listings that meet
                the public rank floor. Nothing is padded.
              </p>
            )}
            <p className="mt-4 text-sm text-muted-foreground">What's on the board right now:</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <article className={statTileClass}>
                <StatTile accent value={formatCount(stats.clicks)} label="clicks" />
              </article>
              <article className={statTileClass}>
                <StatTile value={formatCents(stats.allocatedCents)} label="allocated" />
              </article>
              {highest ? (
                <Link
                  to="/l/$slug"
                  params={{ slug: highest.slug }}
                  className={cn(statTileClass, "hover:bg-card/80")}
                >
                  <StatTile
                    value={formatCents(highest.allocationCents)}
                    label={`highest rank (so far) · ${highest.name}`}
                  />
                </Link>
              ) : (
                <article className={statTileClass}>
                  <StatTile value="—" label="highest rank (so far)" />
                </article>
              )}
              <Link to="/" className={cn(statTileClass, "hover:bg-card/80")}>
                <StatTile value={formatCount(stats.listingCount)} label="listings" />
              </Link>
              <Link
                to="/"
                search={{ board: "today" }}
                className={cn(statTileClass, "hover:bg-card/80")}
              >
                <StatTile value={formatCount(today.length)} label="on today" />
              </Link>
              <Link
                to="/"
                search={{ board: "today" }}
                className={cn(statTileClass, "hover:bg-card/80")}
              >
                <StatTile value={formatCents(todayAllocated)} label="allocated today" />
              </Link>
            </div>
          </section>

          <p className="mt-10 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The board is still here. Same rules. Rank is what you allocated — nothing else.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            The ranking contract is public on{" "}
            <Link to="/how-ranking-works" className="text-primary hover:underline">
              How ranking works
            </Link>
            .
          </p>

          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
