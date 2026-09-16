# Bid Ladder

Next.js App Router monorepo (`apps/web`) hosted on Vercel. Backend is the owned Supabase project in `supabase/config.toml`. Ranking v0.2 stays in Postgres (`recompute_rankings`, `set_allocation`). Avoid rewriting published git history (force-push, rebase, amend, or squash of already-pushed commits).

`main` ships TanStack until cutover. This branch (`cursor/kit-migration`) is the kit stack. Do not point the production Stripe webhook here until phase 6.

Legacy TanStack app: `legacy/tanstack/`.
