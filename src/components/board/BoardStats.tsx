import type { BoardStats } from "@/lib/board.functions";
import { formatCents, formatCount, formatDaysSince } from "@/lib/format";

export function BoardStats({ stats }: { stats: BoardStats }) {
  const since = formatDaysSince(stats.launchedAt);

  return (
    <section aria-label="Board stats" className="px-3 py-6 sm:px-4">
      <h2 className="text-center text-lg text-muted-foreground sm:text-xl">
        Some stats about this{" "}
        <span className="text-primary">allocation board</span>
        {since ? ` since launch ${since}` : null}
      </h2>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl bg-card px-5 py-8 text-center">
          <p className="flex items-center justify-center gap-2 font-display text-3xl tabular-nums tracking-tight sm:text-4xl">
            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
            {formatCount(stats.clicks)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">clicks</p>
        </article>
        <article className="rounded-2xl bg-card px-5 py-8 text-center">
          <p className="allocation-price text-3xl sm:text-4xl">{formatCents(stats.allocatedCents)}</p>
          <p className="mt-2 text-sm text-muted-foreground">allocated</p>
        </article>
        <article className="rounded-2xl bg-card px-5 py-8 text-center">
          <p className="font-display text-3xl tabular-nums tracking-tight sm:text-4xl">
            {formatCount(stats.listingCount)}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">listings</p>
        </article>
      </div>
    </section>
  );
}
