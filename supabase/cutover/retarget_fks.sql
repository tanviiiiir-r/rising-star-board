-- CUTOVER ONLY. Breaks TanStack Auth FKs. Run after Better Auth users exist
-- and immediately before switching Vercel + Stripe webhook to apps/web.

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_owner_id_fkey;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_owner_id_fkey
  FOREIGN KEY (owner_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.wallets DROP CONSTRAINT IF EXISTS wallets_user_id_fkey;
ALTER TABLE public.wallets
  ADD CONSTRAINT wallets_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.credit_ledger DROP CONSTRAINT IF EXISTS credit_ledger_user_id_fkey;
ALTER TABLE public.credit_ledger
  ADD CONSTRAINT credit_ledger_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.point_ledger DROP CONSTRAINT IF EXISTS point_ledger_user_id_fkey;
ALTER TABLE public.point_ledger
  ADD CONSTRAINT point_ledger_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.admin_audit_log DROP CONSTRAINT IF EXISTS admin_audit_log_admin_id_fkey;
ALTER TABLE public.admin_audit_log
  ADD CONSTRAINT admin_audit_log_admin_id_fkey
  FOREIGN KEY (admin_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id) REFERENCES public."user"(id) ON DELETE CASCADE;
