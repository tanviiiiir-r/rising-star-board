# Graph Report - rising-star-board  (2026-09-16)

## Corpus Check
- 109 files · ~38,299 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 257 nodes · 200 edges · 10 communities detected
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 14|Community 14]]

## God Nodes (most connected - your core abstractions)
1. `normalizeCatastrophicSsrResponse()` - 5 edges
2. `ClaimRankControl()` - 5 edges
3. `createPublicSupabase()` - 5 edges
4. `fetch()` - 4 edges
5. `createSupabaseClient()` - 4 edges
6. `snapAllocationCents()` - 4 edges
7. `applyCents()` - 4 edges
8. `isBoardVisible()` - 4 edges
9. `toListing()` - 4 edges
10. `publicSiteUrl()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `normalizeCatastrophicSsrResponse()` --calls--> `consumeLastCapturedError()`  [INFERRED]
  src/server.ts → src/lib/error-capture.ts
- `ClaimRankControl()` --calls--> `costToClaimFirstCents()`  [INFERRED]
  src/components/board/ClaimRankControl.tsx → src/lib/ranking.ts
- `ClaimRankControl()` --calls--> `snapAllocationCents()`  [INFERRED]
  src/components/board/ClaimRankControl.tsx → src/components/board/AmountStepper.tsx
- `ClaimRankControl()` --calls--> `formatCents()`  [INFERRED]
  src/components/board/ClaimRankControl.tsx → src/routes/l.$slug.tsx
- `createPublicSupabase()` --calls--> `publicSupabaseUrl()`  [INFERRED]
  src/lib/supabase-public.server.ts → src/lib/supabase-env.ts

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (10): ClaimRankControl(), MovementBadge(), ceilToIncrement(), costToClaimFirstCents(), getMovement(), isBoardVisible(), meetsNumberOnePremium(), planRankFunding() (+2 more)

### Community 1 - "Community 1"
Cohesion: 0.1
Nodes (7): aboutPageUrl(), CreditTools(), categoriesPageUrl(), HowRankingWorksPage(), rankingPageUrl(), formatCents(), publicSiteUrl()

### Community 2 - "Community 2"
Cohesion: 0.21
Nodes (9): consumeLastCapturedError(), describeError(), describeStatus(), safeStringify(), renderErrorPage(), fetch(), getServerEntry(), isH3SwallowedErrorBody() (+1 more)

### Community 3 - "Community 3"
Cohesion: 0.24
Nodes (7): allocationFrom(), loadDailyArchive(), loadLiveBoard(), rankFrom(), toListing(), withCosts(), createPublicSupabase()

### Community 4 - "Community 4"
Cohesion: 0.2
Nodes (3): categoryIcon(), HottestCategoryCard(), formatRelativeTime()

### Community 5 - "Community 5"
Cohesion: 0.29
Nodes (6): applyCents(), commitInput(), snapAllocationCents(), commitAmount(), handleConfirm(), centsToDollarInput()

### Community 6 - "Community 6"
Cohesion: 0.33
Nodes (5): assertCheckoutCents(), createCreditCheckoutSession(), getStripe(), isStripeConfigured(), stripeSecretKey()

### Community 7 - "Community 7"
Cohesion: 0.39
Nodes (5): createSupabaseClient(), createSupabaseFetch(), publicSupabasePublishableKey(), publicSupabaseUrl(), vitePublic()

### Community 11 - "Community 11"
Cohesion: 0.4
Nodes (2): ThemeToggle(), useTheme()

### Community 14 - "Community 14"
Cohesion: 0.67
Nodes (2): createSupabaseAdminClient(), createSupabaseFetch()

## Knowledge Gaps
- **Thin community `Community 11`** (5 nodes): `ThemeToggle.tsx`, `useTheme.ts`, `ThemeToggle()`, `apply()`, `useTheme()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 14`** (4 nodes): `createSupabaseAdminClient()`, `createSupabaseFetch()`, `isNewSupabaseApiKey()`, `client.server.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `ClaimRankControl()` connect `Community 0` to `Community 1`, `Community 5`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Why does `formatCents()` connect `Community 1` to `Community 0`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `normalizeCatastrophicSsrResponse()` (e.g. with `consumeLastCapturedError()` and `renderErrorPage()`) actually correct?**
  _`normalizeCatastrophicSsrResponse()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `ClaimRankControl()` (e.g. with `costToClaimFirstCents()` and `snapAllocationCents()`) actually correct?**
  _`ClaimRankControl()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `createPublicSupabase()` (e.g. with `publicSupabaseUrl()` and `publicSupabasePublishableKey()`) actually correct?**
  _`createPublicSupabase()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `createSupabaseClient()` (e.g. with `publicSupabaseUrl()` and `publicSupabasePublishableKey()`) actually correct?**
  _`createSupabaseClient()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._