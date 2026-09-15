-- Wipe Bid Ladder preview seed only. Never run against real maker data.
-- Matches emails seed+…@bid-ladder.dev and listing descriptions starting with [SEED].

DELETE FROM public.events
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

DELETE FROM public.admin_audit_log
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

DELETE FROM public.daily_rank_snapshots
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

DELETE FROM public.today_rankings
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

DELETE FROM public.rankings
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

DELETE FROM public.daily_allocations
WHERE listing_id IN (SELECT id FROM public.listings WHERE description LIKE '[SEED]%');

UPDATE public.wallets w
SET available_cents = GREATEST(
  0,
  w.available_cents
    + COALESCE((
      SELECT SUM(l.allocation_cents)
      FROM public.listings l
      WHERE l.owner_id = w.user_id
        AND l.description LIKE '[SEED]%'
    ), 0)
    - COALESCE((
      SELECT SUM(cl.amount_cents)
      FROM public.credit_ledger cl
      WHERE cl.user_id = w.user_id
        AND cl.reason = 'preview seed'
    ), 0)
);

DELETE FROM public.credit_ledger
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'seed+%@bid-ladder.dev')
   OR reason = 'preview seed';

DELETE FROM public.wallets
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'seed+%@bid-ladder.dev');

DELETE FROM public.listings
WHERE description LIKE '[SEED]%';

DELETE FROM auth.identities
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'seed+%@bid-ladder.dev');

DELETE FROM auth.users
WHERE email LIKE 'seed+%@bid-ladder.dev';

SELECT public.recompute_rankings();
