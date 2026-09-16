-- Copy auth.users into Better Auth public.user with the same UUID.
-- Safe to re-run. Does not retarget listing/wallet FKs.
-- Do not run the FK retarget while TanStack is still production.
--
-- Run on a CLONE (or preview DB) first — not production until the cutover window.
-- Does not copy Better Auth `account` password hashes. See copy_accounts.sql.
-- First login after copy: magic-link or password reset.

INSERT INTO public."user" (
  id,
  name,
  email,
  "emailVerified",
  "createdAt",
  "updatedAt",
  role,
  "onboardingComplete"
)
SELECT
  u.id,
  COALESCE(p.display_name, split_part(u.email, '@', 1), 'Member'),
  u.email,
  COALESCE(u.email_confirmed_at IS NOT NULL, false),
  u.created_at,
  now(),
  CASE WHEN EXISTS (
    SELECT 1 FROM public.user_roles r
    WHERE r.user_id = u.id AND r.role = 'admin'
  ) THEN 'admin' ELSE 'user' END,
  true
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  "updatedAt" = now();
