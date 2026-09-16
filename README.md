# Bid Ladder

Public allocation board. Rank is what you allocated.

This branch is the supastarter Next.js monorepo. `apps/web` is the product. Ranking stays in Postgres. The TanStack app lives in `legacy/tanstack/` until cutover.

```sh
pnpm install
pnpm --filter @repo/database generate
pnpm --filter web dev
```

Cutover steps: [docs/cutover.md](docs/cutover.md).
