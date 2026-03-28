# VidMetrics Competitor Pulse

VidMetrics Competitor Pulse is a Next.js 16 MVP for competitor YouTube analysis. An analyst can
paste a public channel URL, inspect current-month uploads ranked by momentum, filter the shortlist,
export CSV, save temporary snapshots for the current browser demo session, and walk a mock
enterprise checkout flow that ends in `Pending activation`.

Live URL: `https://vidmetrics-competitor.vercel.app`

## Features

- `POST /api/analyze` returns the existing analysis payload for a YouTube channel URL.
- `POST /api/analysis-snapshots` saves a temporary browser-session snapshot.
- `GET /api/analysis-snapshots` lists snapshots for the active browser session.
- `DELETE /api/analysis-snapshots` clears snapshots for the active browser session.
- `GET /api/upgrade-checkout` returns mock checkout state for the active browser session.
- `POST /api/upgrade-checkout/start` creates or overwrites a session-scoped draft checkout.
- `POST /api/upgrade-checkout/confirm` submits the mock checkout and returns pending activation.
- Responsive dashboard with summary cards, momentum chart, sortable table, filters, and CSV export.
- SaaS shell with plan badge, workspace navigation, gated workflow cards, and checkout drawer.
- Static legal surfaces for `Terms`, `Privacy`, `Copyright`, and `Legal Notice`.

## Architecture

The app now uses a small CQRS split without external persistence:

- Query side: analyze competitor channel, list current-session snapshots, get upgrade checkout state.
- Command side: save analysis snapshot, clear current-session snapshots, start checkout, confirm checkout.
- Domain: velocity, trend, ranking, and summary calculations.
- Commercial upgrade bounded context: OOP-first aggregate and value objects for checkout.
- Read models: transport/UI payloads are mapped outside the domain.
- Infrastructure: YouTube Data API adapter, session-scoped in-memory snapshot repository, and
  in-memory request guard.

This is intentionally a pragmatic DDD slice, not a heavy enterprise rewrite. The domain is kept free
of presentation-only fields such as `videoUrl`, `durationText`, and month labels.

## TDD Notes

The refactor and hardening pass in this repo was implemented test-first for the new behavior:

- rate limiting and client-safe errors
- query and command handlers
- read-model mapping
- snapshot transport routes

The older MVP history in git is not detailed enough to prove a full historical red-green workflow
for the original greenfield implementation.

## Local Setup

Requirements:

- Node.js 22 LTS or newer
- npm
- YouTube Data API v3 key
- Vercel account for deployment

Install and run:

```bash
npm install
copy .env.example .env.local
```

Set:

```bash
YOUTUBE_API_KEY=your_key_here
```

Then:

```bash
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Deploy Notes

The production project is linked to Vercel. `YOUTUBE_API_KEY` must exist in runtime env for the app
to work outside local development.

Example CLI flow:

```bash
npx vercel env add YOUTUBE_API_KEY production --value "your_key_here" --yes
npx vercel --prod --yes
```

## Smoke Checklist

- homepage renders on desktop
- homepage renders on mobile
- analyze `https://www.youtube.com/@MKBHD`
- sort and filter work after analysis
- CSV export downloads
- save snapshot works
- saved snapshots list renders
- clear session works
- open pricing drawer
- start mock checkout draft
- submit checkout and verify `Pending activation`

## Repository Notes

- Public competitor data only: watch time, CTR, retention, and impressions are not available.
- Each analysis request is capped at `100` public uploads from the active month for the selected
  channel. This keeps API usage and response times predictable for the MVP demo.
- Snapshot persistence is intentionally non-durable and scoped to the active browser session.
- Checkout state is intentionally non-durable and scoped to the active browser session.
- The request guard adds per-process rate limiting and in-flight request deduplication.

## Security And Production Readiness

This repo is hardened enough for a live MVP demo, but it is not a production-grade public backend
yet.

- `POST /api/analyze` is still a public, quota-consuming endpoint. The current guard is
  per-process in-memory only, so it is not a durable or globally enforced rate limit.
- `analysis-snapshots` and `upgrade-checkout` use a browser-session identifier, not real auth or
  authorization. That is acceptable for a scoped demo, not for a real multi-user product.
- Write endpoints outside `/api/analyze` do not yet have stronger abuse controls beyond request
  validation.
- Browser hardening headers such as a stricter CSP baseline, frame protection, and `nosniff` still
  need to be added before calling the app production-ready.
- The legal pages included in this repo are MVP placeholders and still require operator details and
  legal review before launch.

Recommended production upgrades:

- move rate limiting to a shared durable layer
- introduce server-managed or signed sessions, then real auth when the product needs it
- add security headers and origin-aware request protections
- treat the current API posture as `demo-safe`, not `public-backend-safe`

## Authors

- OpenAI Codex
