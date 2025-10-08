### TODO — Quick Investment Mode (Low Cognitive Load, Step-by-Step)

0) Improvements (sorted by importance)
- [X] Filter entities per cast to be unique.
- [ ] clickhouse insert: batch casts
- [ ] currently a lot of console output in fetch_casts. review what is really needed
Analytics & Data
- [ ] Compute trust_score, risk_tier, trend for each entity
- [ ] Compute topic for each cast (1 word topic)


1) Analytics & Data
*This will be hosted on Heroku*
- [X] Create ClickHouse Cloud service
- [ ] get connection URL + credentials
- [ ] Add `.env` for CH and PG URLs; wire them in Node + Python
- [ ] Create Postgres database (managed or local) for app state. this stores emphemeral/session data. maybe via heroku. do later
- [ ] Initialize Prisma in the repo and configure Postgres URL
- [ ] Define Prisma schema for users, investments, sessions (minimal)
- [X] Create ClickHouse SQL tables for casts, entities, opportunities. table for opportunities not needed
- [X] Write Python script `scripts/extract_entities.py` (spaCy/LLM optional) to:
  - [X] Fetch latest 10 casts (ignore < 150 chars)
  - [X] Extract entities
  - [X] Write each entity/opportunity row to ClickHouse as soon as ready

2) Server APIs
- [ ] POST `/api/analytics/start` to trigger Python job (background)
- [ ] GET `/api/entities` to return latest ready entities (polling, cursor/since)
- [ ] POST `/api/invest` to record an investment (writes to Postgres via Prisma)
- [ ] (Optional) GET `/api/wallet` to fetch wallet state or include in entities response

3) Client Orchestration (Next.js)
- [ ] Repurpose `Intuition.tsx` to orchestrate flow (splash → deck → summary)
- [ ] Splash screen component with messages and call to `/api/analytics/start`
- [ ] Poll `/api/entities` until first results; then show deck
- [ ] Maintain wallet state in client (start with $50)

4) Swipe Deck MVP
- [ ] Create `SwipeDeck.tsx` (stack container + gesture handling)
- [ ] Create `EntityCard.tsx` (entity name, trust score, context, badges)
- [ ] Create `InvestmentControls.tsx` (up/down adjust, current amount)
- [ ] Create `WalletBar.tsx` (running total, remaining balance)
- [ ] Create `ResultToast.tsx` (success animation and copy)
- [ ] Wire gestures: left=skip, right=invest, up/down=amount, long-press=details
- [ ] On invest: call `/api/invest`, optimistic UI update, then next card

5) Session Summary
- [ ] `SessionSummary.tsx` with totals, per-entity list, CTA buttons

6) UX/Styling
- [ ] Minimal animations (card slide, invest celebration)
- [ ] Risk badge colors and trend arrows
- [ ] Responsive layout for mobile-first

7) Observability & QA
- [ ] Add basic logging on server + Python script
- [ ] Handle empty/no-entity cases gracefully
- [ ] Add simple error messages and retry for network calls

8) Nice-to-Have (Later)
- [ ] Switch polling to SSE stream when stable
- [ ] Add early-bird rank logic and leaderboard
- [ ] Compare with Intuition blockchain data in a new API endpoint

## Quick Investment Mode — Implementation Plan (Rewrite vs New)

### Goals
- Deliver “Swipe-to-Invest” MVP: one-entity-at-a-time cards, quick decisions, minimal friction.
- Stream entities discovered from recent casts into the UI as they’re ready (don’t wait for full batch).
- Run a Python analytics script on app open: fetch latest 10 casts, ignore texts < 150 chars, extract entities + trust scores, write results incrementally to DB.
- Use Redshift in cloud, with a local open-source alternative (PostgreSQL) for development to learn cloud data engineering.

---

### Current Code Review

1) `src/components/Intuition.tsx` — STATUS: Rewrite
- Observed:
  - Fetches feed via `api/feeds`, renders a simple list with a `Link` to `/uploadtrust` passing full cast text via query string.
  - No swipe card UX, wallet state, or investment actions.
  - Uses `sdk.context` to get `fid` and username; that’s good but needs better error/empty handling.
  - Query string composition is wrong for multiple params (uses two `?`).
- Rewrite Rationale:
  - This component should orchestrate: splash → trigger analytics → stream entities → swipe deck.
  - Must not pass large `text` in the URL; use IDs and server lookup.
  - Needs a proper state machine for loading, streaming, and interaction.

2) `src/components/UploadTrust.tsx` — STATUS: Replace (Build New)
- Observed:
  - Intended for an entity table + toggles, not card-swipe UX.
  - Several issues (missing `handleToggleChange`, invalid JSX closing tag, incorrect key expression, untyped `entities`).
- Replace Rationale:
  - MVP focuses on swipe-to-invest, not a table. Replace with purpose-built card components and investment controls.

---

### Architecture Overview
- Client (Next.js App Router) handles:
  - Splash screen and loading copy.
  - Starts analytics job via API.
  - Subscribes to a stream (SSE/WebSocket) or polls for newly available entities.
  - Renders swipeable cards with investment controls and running wallet balance.
- Server (Next.js API routes) handles:
  - Kicking off the Python job.
  - Serving entity batches from DB.
  - Recording investments.
  - Optional: server-sent events for “new entity ready”.
- Analytics (Python) handles:
  - Fetch latest 10 casts, filter by length ≥ 150 chars.
  - Extract entities + compute trust scores + metadata.
  - Write each entity row to DB immediately as it’s ready.
  - Deployed on Heroku. I deploy a tiny FastAPI/Flask app/worker that exposes an endpoint for fetching casts. Alternative is to run it as a worker that starts with a message. Nextjs app calls the heroku URL to start analytics and then polls clickhouse. 

---

### Data Layer
- Cloud: Amazon Redshift (columnar, analytics-friendly) for production or ClickHouse Cloud (open source alternative)
- Local Dev: PostgreSQL (open source). Keep schema compatible; avoid DB-specific features.
- Access Layer: Prisma/Drizzle ORM for TypeScript services; Python uses SQLAlchemy/psycopg for Postgres and `redshift_connector` or SQLAlchemy Redshift dialect for cloud.

Schema (DB-agnostic draft)
- users: id (pk), fid, username, created_at
- casts: id (pk), cast_id (provider id/hash), author, text, timestamp
- entities: id (pk), name, source_cast_id (fk casts.id), trust_score (0..1), risk_tier (enum), trend (int), created_at
- opportunities: id (pk), entity_id (fk entities.id), current_cost, potential_multiplier, early_bird_rank, created_at
- investments: id (pk), user_id (fk users.id), entity_id (fk entities.id), amount, snapshot_multiplier, created_at

---

### APIs (Server)
- POST `/api/analytics/start` — Start Python job (idempotent per session): accepts optional `fid`. Returns a job/session id.
- GET `/api/entities` — Paginated list or incremental stream for ready entities (filter by `since` or `cursor`).
- POST `/api/invest` — Record an investment decision: { entityId, amount } → returns updated wallet and confirmation payload.
- GET `/api/wallet` — Current session wallet balance and totals (or include in `/api/entities` response header/payload).
- Optional: `/api/events` (SSE) — Push new entity rows as they land.

---

### Python Analytics Job (New)
- Location: `scripts/extract_entities.py` (new).
- Trigger: via `/api/analytics/start` using a background process or job queue.
- Steps:
  1) Fetch latest 10 casts (from Farcaster API/Neynar or via existing `/api/feeds`).
  2) Filter casts with text length < 150 (exclude).
  3) For each cast (sequentially or small batch):
     - Extract entities (spaCy or LLM-based NER).
     - Compute trust_score (0..1), risk_tier, trend, early_bird_rank seeds.
     - Determine `current_cost` and `potential_multiplier` heuristics.
     - Write to DB immediately (insert `casts` if missing, then `entities` and `opportunities`).
  4) Exit when all eligible casts processed.

Notes
- Results must be written row-by-row (entity-level) as soon as they are ready.
- Use env-driven DB connection strings to support Postgres local and Redshift staging/prod.

---

### UX Flow → Components Mapping
1) Splash Screen (New)
   - Component: `Splash.tsx` — shows “Finding your next investment opportunity… Analyzing trending entities…”.
   - Behavior: Calls `/api/analytics/start` once; transitions when first entities are ready or after a short minimum display time.

2) Swipe Deck (New)
   - Components: `SwipeDeck.tsx`, `EntityCard.tsx`, `InvestmentControls.tsx`, `WalletBar.tsx`, `ResultToast.tsx`.
   - Gestures: left/skip, right/invest, up/down adjust amount, long-press for details.
   - Data: subscribes to entity stream; preloads next N cards.
   - Feedback: celebration animation, running totals, risk badges, trend arrows.

3) Portfolio Summary (New)
   - Component: `SessionSummary.tsx` — displays session totals and per-entity investments; CTA buttons.

---

### File-by-File Plan

Rewrite
- `src/components/Intuition.tsx`
  - Role changes from list renderer to app orchestrator/state machine.
  - Implement splash → stream → deck flow; remove direct `Link` with large query; use internal routing/state.
  - Manage wallet state (starting budget), investment actions, and transition to summary.

Replace (Build New Instead of `UploadTrust.tsx`)
- Remove table-based approach; create:
  - `src/components/Splash.tsx` (new)
  - `src/components/SwipeDeck.tsx` (new)
  - `src/components/EntityCard.tsx` (new)
  - `src/components/InvestmentControls.tsx` (new)
  - `src/components/WalletBar.tsx` (new)
  - `src/components/ResultToast.tsx` (new)
  - `src/components/SessionSummary.tsx` (new)

Build From Scratch (Server & Infra)
- API routes:
  - `src/app/api/analytics/start/route.ts` (new)
  - `src/app/api/entities/route.ts` (new)
  - `src/app/api/invest/route.ts` (new)
  - Optional: `src/app/api/events/route.ts` (SSE) (new)
- Python analytics:
  - `scripts/extract_entities.py` (new)
- DB access:
  - ORM setup (Prisma/Drizzle) with models for users, casts, entities, opportunities, investments (new)
  - Migrations for Postgres (dev) and Redshift-compatible SQL for prod (new)

Keep (With Minor Adjustments)
- `src/app/api/feeds` — may reuse for Python job input; ensure it supports `fid` and returns text + metadata needed (no blocking changes now).
- Global styles `src/app/globals.css` — extend with animations and card styles (incremental changes).

---

### Interaction & State Logic (High-Level)
- On app load:
  - Show Splash; POST `/api/analytics/start` with optional `fid`.
  - Begin polling `/api/entities` (or open SSE) for ready entities.
  - When first entities arrive, transition to `SwipeDeck`.
- Within `SwipeDeck`:
  - Maintain `walletBalance`, `currentAmount`, and `runningTotals`.
  - Gestures: left (skip), right (POST `/api/invest`), up/down (adjust amount), long-press (show details modal).
  - Upon invest, optimistically update UI, show success animation, load next card.
- Session end:
  - When wallet exhausted or deck ends, show `SessionSummary` with investments and projected returns.

---

### Assumptions & Open Questions
- Entity extraction approach: spaCy vs LLM (cost/latency tradeoff). MVP can start with spaCy, upgrade later.
- Trend/early-bird logic: placeholder heuristics initially, refine with usage data.
- Streaming method: start with polling to simplify; upgrade to SSE when stable.
- Auth: rely on Farcaster context when available; fall back to guest session with ephemeral user record.

---

### Next Steps (Incremental, Low Cognitive Load)
1) Rewrite `Intuition.tsx` to provide Splash → Deck orchestration (no new UI polish yet).
2) Add `/api/analytics/start` and a stub Python script that writes one mock entity into Postgres to verify end-to-end flow.
3) Create `SwipeDeck.tsx` + `EntityCard.tsx` with minimal swipe/skip/right and amount adjust.
4) Wire `/api/invest` and wallet state; show `WalletBar` and `ResultToast`.
5) Replace `UploadTrust.tsx` usage with new deck route.
6) Expand Python to real extraction over 10 casts; write entities incrementally; switch DB to Redshift in staging.


