-- Preview seed for Bid Ladder Cloud (unpublished).
-- Idempotent: wipes prior seed+@bid-ladder.dev / [SEED] rows first.
-- 8 makers, 20 public listings. Allocations $10–$170 so All-time and Today are populated.
-- Also attaches 3 dashboard fixtures to the oldest non-seed user.

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
DELETE FROM public.listings WHERE description LIKE '[SEED]%';
DELETE FROM auth.identities
WHERE user_id IN (SELECT id FROM auth.users WHERE email LIKE 'seed+%@bid-ladder.dev');
DELETE FROM auth.users WHERE email LIKE 'seed+%@bid-ladder.dev';

INSERT INTO public.listings (
  id, owner_id, category_id, name, tagline, url, description, slug, status, approved_at
)
SELECT
  l.id,
  o.id,
  c.id,
  l.name,
  l.tagline,
  l.url,
  l.description,
  l.slug,
  'approved',
  now()
FROM (
  SELECT id
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST, created_at ASC
  LIMIT 1
) o
JOIN (
  VALUES
    ('22222222-2222-4222-8222-222222222201'::uuid, 'agents', 'Northstar Agents', 'Autonomous ops agents for small teams.', 'https://seed.bid-ladder.dev/northstar', '[SEED] Preview listing. Wipe before publish.', 'seed-northstar-agents'),
    ('22222222-2222-4222-8222-222222222202'::uuid, 'business', 'Ledgerlift', 'Close books without the week-long scramble.', 'https://seed.bid-ladder.dev/ledgerlift', '[SEED] Preview listing. Wipe before publish.', 'seed-ledgerlift'),
    ('22222222-2222-4222-8222-222222222203'::uuid, 'seo', 'Rankkit SEO', 'Watch indexation without a 40-tab ritual.', 'https://seed.bid-ladder.dev/rankkit', '[SEED] Preview listing. Wipe before publish.', 'seed-rankkit-seo'),
    ('22222222-2222-4222-8222-222222222204'::uuid, 'marketing', 'Pulse Mail', 'Campaigns that stay inside one inbox.', 'https://seed.bid-ladder.dev/pulsemail', '[SEED] Preview listing. Wipe before publish.', 'seed-pulse-mail'),
    ('22222222-2222-4222-8222-222222222205'::uuid, 'developer', 'Stacklane', 'Ship internal tools on the same repo.', 'https://seed.bid-ladder.dev/stacklane', '[SEED] Preview listing. Wipe before publish.', 'seed-stacklane'),
    ('22222222-2222-4222-8222-222222222206'::uuid, 'productivity', 'Quiet Hours', 'Calendar blocks that actually hold.', 'https://seed.bid-ladder.dev/quiethours', '[SEED] Preview listing. Wipe before publish.', 'seed-quiet-hours'),
    ('22222222-2222-4222-8222-222222222207'::uuid, 'crypto', 'Coinrail', 'Treasury alerts without the noise.', 'https://seed.bid-ladder.dev/coinrail', '[SEED] Preview listing. Wipe before publish.', 'seed-coinrail'),
    ('22222222-2222-4222-8222-222222222208'::uuid, 'health', 'Clinicdesk', 'Front-desk ops for small clinics.', 'https://seed.bid-ladder.dev/clinicdesk', '[SEED] Preview listing. Wipe before publish.', 'seed-clinicdesk'),
    ('22222222-2222-4222-8222-222222222209'::uuid, 'design', 'Pixelyard', 'Design tokens that stay in sync.', 'https://seed.bid-ladder.dev/pixelyard', '[SEED] Preview listing. Wipe before publish.', 'seed-pixelyard'),
    ('22222222-2222-4222-8222-222222222210'::uuid, 'hiring', 'Hireloop', 'Take-home reviews without the spreadsheet.', 'https://seed.bid-ladder.dev/hireloop', '[SEED] Preview listing. Wipe before publish.', 'seed-hireloop'),
    ('22222222-2222-4222-8222-222222222211'::uuid, 'travel', 'Atlas Travel', 'Itineraries that survive timezone math.', 'https://seed.bid-ladder.dev/atlas', '[SEED] Preview listing. Wipe before publish.', 'seed-atlas-travel'),
    ('22222222-2222-4222-8222-222222222212'::uuid, 'ecommerce', 'Shopnest', 'Catalog ops for a one-person shop.', 'https://seed.bid-ladder.dev/shopnest', '[SEED] Preview listing. Wipe before publish.', 'seed-shopnest'),
    ('22222222-2222-4222-8222-222222222213'::uuid, 'writing', 'Notehorn', 'Long notes that stay searchable.', 'https://seed.bid-ladder.dev/notehorn', '[SEED] Preview listing. Wipe before publish.', 'seed-notehorn'),
    ('22222222-2222-4222-8222-222222222214'::uuid, 'audio', 'Waveform Audio', 'Show notes from the same take.', 'https://seed.bid-ladder.dev/waveform', '[SEED] Preview listing. Wipe before publish.', 'seed-waveform-audio'),
    ('22222222-2222-4222-8222-222222222215'::uuid, 'analytics', 'Daybreak Analytics', 'One number the team can argue about.', 'https://seed.bid-ladder.dev/daybreak', '[SEED] Preview listing. Wipe before publish.', 'seed-daybreak-analytics'),
    ('22222222-2222-4222-8222-222222222216'::uuid, 'education', 'Campuswire', 'Office hours that scale past 40 students.', 'https://seed.bid-ladder.dev/campuswire', '[SEED] Preview listing. Wipe before publish.', 'seed-campuswire'),
    ('22222222-2222-4222-8222-222222222217'::uuid, 'other', 'Otherbox', 'A catch-all that still looks finished.', 'https://seed.bid-ladder.dev/otherbox', '[SEED] Preview listing. Wipe before publish.', 'seed-otherbox'),
    ('22222222-2222-4222-8222-222222222218'::uuid, 'productivity', 'Draftshelf', 'A shelf for drafts that still ship.', 'https://seed.bid-ladder.dev/draftshelf', '[SEED] Preview listing. Wipe before publish.', 'seed-draftshelf'),
    ('22222222-2222-4222-8222-222222222219'::uuid, 'leaderboards', 'Signalboard', 'Live ranks without the spreadsheet.', 'https://seed.bid-ladder.dev/signalboard', '[SEED] Preview listing. Wipe before publish.', 'seed-signalboard'),
    ('22222222-2222-4222-8222-222222222220'::uuid, 'security', 'Vaultkey', 'Secrets rotation for a two-person team.', 'https://seed.bid-ladder.dev/vaultkey', '[SEED] Preview listing. Wipe before publish.', 'seed-vaultkey')
) AS l(id, category_slug, name, tagline, url, description, slug) ON TRUE
JOIN public.categories c ON c.slug = l.category_slug;

INSERT INTO public.listings (
  id, owner_id, category_id, name, tagline, url, description, slug, status, approved_at, rejection_reason
)
SELECT
  l.id,
  r.id,
  c.id,
  l.name,
  l.tagline,
  l.url,
  l.description,
  l.slug,
  l.status::public.listing_status,
  l.approved_at,
  l.rejection_reason
FROM (
  SELECT id
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST, created_at ASC
  LIMIT 1
) r
JOIN (
  VALUES
    ('22222222-2222-4222-8222-222222222221'::uuid, 'leaderboards', 'Harborboard', 'A listing still waiting on review.', 'https://seed.bid-ladder.dev/harborboard', '[SEED] Preview listing. Wipe before publish.', 'seed-harborboard', 'pending', NULL::timestamptz, NULL::text),
    ('22222222-2222-4222-8222-222222222222'::uuid, 'productivity', 'Stilldesk', 'Approved, not yet allocated.', 'https://seed.bid-ladder.dev/stilldesk', '[SEED] Preview listing. Wipe before publish.', 'seed-stilldesk', 'approved', now(), NULL::text),
    ('22222222-2222-4222-8222-222222222223'::uuid, 'developer', 'Rungkit', 'Your listing already on the board.', 'https://seed.bid-ladder.dev/rungkit', '[SEED] Preview listing. Wipe before publish.', 'seed-rungkit', 'approved', now(), NULL::text)
) AS l(id, category_slug, name, tagline, url, description, slug, status, approved_at, rejection_reason)
  ON TRUE
JOIN public.categories c ON c.slug = l.category_slug;

INSERT INTO public.wallets (user_id, available_cents)
SELECT id, 65000
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST, created_at ASC
LIMIT 1
ON CONFLICT (user_id) DO UPDATE
SET available_cents = public.wallets.available_cents + EXCLUDED.available_cents;

INSERT INTO public.credit_ledger (user_id, amount_cents, type, reference_type, reason, idempotency_key)
SELECT id, 65000, 'admin_grant', 'admin_grant', 'preview seed', 'seed-grant-reviewer'
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST, created_at ASC
LIMIT 1
ON CONFLICT (idempotency_key) DO NOTHING;

UPDATE public.listings AS l
SET allocation_cents = v.cents, allocation_set_at = now()
FROM (
  VALUES
    ('22222222-2222-4222-8222-222222222201'::uuid, 17000),
    ('22222222-2222-4222-8222-222222222202'::uuid, 8500),
    ('22222222-2222-4222-8222-222222222219'::uuid, 4500),
    ('22222222-2222-4222-8222-222222222203'::uuid, 4200),
    ('22222222-2222-4222-8222-222222222204'::uuid, 3000),
    ('22222222-2222-4222-8222-222222222205'::uuid, 2500),
    ('22222222-2222-4222-8222-222222222223'::uuid, 2500),
    ('22222222-2222-4222-8222-222222222206'::uuid, 2000),
    ('22222222-2222-4222-8222-222222222207'::uuid, 1800),
    ('22222222-2222-4222-8222-222222222220'::uuid, 1600),
    ('22222222-2222-4222-8222-222222222208'::uuid, 1500),
    ('22222222-2222-4222-8222-222222222209'::uuid, 1400),
    ('22222222-2222-4222-8222-222222222210'::uuid, 1300),
    ('22222222-2222-4222-8222-222222222211'::uuid, 1200),
    ('22222222-2222-4222-8222-222222222212'::uuid, 1100),
    ('22222222-2222-4222-8222-222222222213'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222214'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222215'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222216'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222217'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222218'::uuid, 1000)
) AS v(id, cents)
WHERE l.id = v.id;

INSERT INTO public.daily_allocations (listing_id, utc_date, amount_cents, first_allocated_at)
SELECT v.id, (timezone('utc', now()))::date, v.cents, now()
FROM (
  VALUES
    ('22222222-2222-4222-8222-222222222201'::uuid, 17000),
    ('22222222-2222-4222-8222-222222222202'::uuid, 8500),
    ('22222222-2222-4222-8222-222222222219'::uuid, 4500),
    ('22222222-2222-4222-8222-222222222203'::uuid, 4200),
    ('22222222-2222-4222-8222-222222222204'::uuid, 3000),
    ('22222222-2222-4222-8222-222222222205'::uuid, 2500),
    ('22222222-2222-4222-8222-222222222223'::uuid, 2500),
    ('22222222-2222-4222-8222-222222222206'::uuid, 2000),
    ('22222222-2222-4222-8222-222222222207'::uuid, 1800),
    ('22222222-2222-4222-8222-222222222220'::uuid, 1600),
    ('22222222-2222-4222-8222-222222222208'::uuid, 1500),
    ('22222222-2222-4222-8222-222222222209'::uuid, 1400),
    ('22222222-2222-4222-8222-222222222210'::uuid, 1300),
    ('22222222-2222-4222-8222-222222222211'::uuid, 1200),
    ('22222222-2222-4222-8222-222222222212'::uuid, 1100),
    ('22222222-2222-4222-8222-222222222213'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222214'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222215'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222216'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222217'::uuid, 1000),
    ('22222222-2222-4222-8222-222222222218'::uuid, 1000)
) AS v(id, cents)
ON CONFLICT (listing_id, utc_date) DO UPDATE SET
  amount_cents = EXCLUDED.amount_cents,
  first_allocated_at = EXCLUDED.first_allocated_at;

UPDATE public.wallets
SET available_cents = GREATEST(0, available_cents - 60100)
WHERE user_id = (
  SELECT owner_id FROM public.listings WHERE id = '22222222-2222-4222-8222-222222222201'
);

-- All-time keeps the set_allocation totals. Today is shifted so the boards
-- do not look identical: Ledgerlift leads Today, Northstar stays All-time #1.
UPDATE public.daily_allocations
SET amount_cents = 8000
WHERE listing_id = '22222222-2222-4222-8222-222222222201'
  AND utc_date = (timezone('utc', now()))::date;

UPDATE public.daily_allocations
SET amount_cents = 2000
WHERE listing_id = '22222222-2222-4222-8222-222222222203'
  AND utc_date = (timezone('utc', now()))::date;

INSERT INTO public.daily_allocations (listing_id, utc_date, amount_cents, first_allocated_at)
VALUES
  ('22222222-2222-4222-8222-222222222202', (timezone('utc', now()))::date - 1, 9000, now() - interval '1 day'),
  ('22222222-2222-4222-8222-222222222201', (timezone('utc', now()))::date - 1, 4000, now() - interval '1 day' + interval '1 hour'),
  ('22222222-2222-4222-8222-222222222205', (timezone('utc', now()))::date - 1, 2500, now() - interval '1 day' + interval '2 hour')
ON CONFLICT (listing_id, utc_date) DO UPDATE SET
  amount_cents = EXCLUDED.amount_cents,
  first_allocated_at = EXCLUDED.first_allocated_at;

INSERT INTO public.daily_rank_snapshots (
  utc_date, listing_id, rank, allocation_cents, unique_views, shares, frozen_at
)
VALUES
  ((timezone('utc', now()))::date - 1, '22222222-2222-4222-8222-222222222202', 1, 9000, 0, 0, ((timezone('utc', now()))::date)::timestamp AT TIME ZONE 'utc'),
  ((timezone('utc', now()))::date - 1, '22222222-2222-4222-8222-222222222201', 2, 4000, 0, 0, ((timezone('utc', now()))::date)::timestamp AT TIME ZONE 'utc'),
  ((timezone('utc', now()))::date - 1, '22222222-2222-4222-8222-222222222205', 3, 2500, 0, 0, ((timezone('utc', now()))::date)::timestamp AT TIME ZONE 'utc')
ON CONFLICT (utc_date, listing_id) DO UPDATE SET
  rank = EXCLUDED.rank,
  allocation_cents = EXCLUDED.allocation_cents,
  frozen_at = EXCLUDED.frozen_at;

SELECT public.recompute_rankings();
