# Phase 6 cutover

Production stays on TanStack (`main`) until this list is finished. One Stripe webhook owner at a time. Do not run these production steps from a preview or this migration branch. Do not `vercel --prod` from `cursor/kit-migration`.

## Before the window

- [ ] Preview `apps/web` on the migration branch with Stripe **test** keys only. Test webhook URL: `https://<preview-host>/api/webhooks/payments`.
- [ ] Confirm `/`, Today, Daily, `/l/[slug]`, `/categories`, `/about`, `/how-ranking-works` read the same Postgres as production.
- [ ] Run `supabase/cutover/copy_users.sql` on a **clone**, not prod. Then `copy_accounts.sql` (documents that passwords are not copied).
- [ ] Confirm Better Auth login for a copied UUID user on preview. First login is **magic-link or password reset** — Supabase bcrypt hashes cannot be copied into Better Auth scrypt `account` rows.
- [ ] Confirm test checkout → `credit_ledger` once → dashboard `set_allocation` → board rank. Signed-in only. Guest checkout without `user_id` is not credited.
- [ ] Keep Prisma `rejectUnauthorized: false` for `*.supabase.co` / `pooler.supabase.com`.
- [ ] Keep the last successful TanStack production deploy as instant rollback.

## Cutover window

1. Freeze admin writes if live checkout is in flight.
2. Apply `supabase/migrations/20260916000000_better_auth_tables.sql` if not already applied.
3. Run `supabase/cutover/copy_users.sql` on production.
4. Confirm a migrated UUID can log in on a Next preview (magic-link / reset).
5. Merge `cursor/kit-migration` → `main` (this replaces TanStack on main). Do not force-push.
6. Point the **existing** Vercel project at this repo: pnpm, Next, `turbo build --filter=web` (see root `vercel.json`). Do not add a second production domain. Do not create a second Vercel project.
7. Run `supabase/cutover/retarget_fks.sql`. This breaks TanStack Auth FKs — only after steps 5–6.
8. Move Stripe webhook from TanStack `/api/stripe/webhook` to Next `/api/webhooks/payments`. Production `STRIPE_WEBHOOK_SECRET` moves with it. No dual live webhooks.
9. Watch: checkout complete → ledger row → allocation → board rank. Login with a migrated UUID. Admin review queue + recompute RPC.
10. Keep the last TanStack deploy as rollback for about 7 days. Then delete `legacy/tanstack`.

## Rollback

1. Point Vercel back at the last TanStack production deploy (`framework: null`, bun).
2. Point Stripe webhook back to `/api/stripe/webhook`.
3. Do not re-run `retarget_fks.sql` in reverse unless listings/wallets are orphaned; TanStack still talks to `auth.users` until FKs were retargeted.

## Out of scope during this window

- Dual production webhooks
- Rewriting ranking in TypeScript
- Enabling kit orgs, seats, chatbot, or marketing/blog
