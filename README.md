# VidMetrics Competitor Pulse

VidMetrics Competitor Pulse is a Next.js 16 B2B MVP for competitor YouTube analysis. Users sign in
to access the main workspace on `/`, analyze a public channel, filter and export the current-month
shortlist, save temporary current-session snapshots, and upgrade through Stripe-hosted sandbox
Checkout. Paid workflows unlock only after Stripe webhooks confirm subscription billing. The Stripe
return page is intentionally public so post-checkout billing state can resolve by `session_id`
without depending on an immediate Clerk re-sync after cross-origin navigation.

Live URL: `https://vidmetrics-competitor.vercel.app`

## MVP Surface

Free, signed-in workspace on `/`:

- analyze one public YouTube channel at a time
- filter and sort the current-month shortlist
- export filtered CSV
- save temporary current-session snapshots scoped to the active browser session

Paid, account-level workflows after webhook-confirmed billing:

- `Saved Reports`: durable report library in Postgres
- `Weekly Tracking`: pin channels and refresh them manually from the workspace
- `Multi-channel Benchmarks`: compare up to three saved reports or tracked channels

## Architecture

The repo uses a pragmatic DDD and CQRS split:

- `analysis` bounded context: ranking, trend, and summary logic for public YouTube data
- `commercial-upgrade` bounded context: plan selection, billing state, and feature entitlements
- command side: start checkout, apply Stripe webhook events, save durable reports, save tracked channels
- query side: analysis results, checkout state, saved reports, tracked channels
- ports/adapters boundary: Clerk auth, Stripe billing, YouTube API, and Postgres stay outside the domain

This is intentionally not a heavy enterprise rewrite. The domain keeps business rules, while
transport and infrastructure stay thin.

## Auth And Route Behavior

- `/` is a protected workspace route; signed-out document requests are redirected to Clerk sign-in
- `/reports`, `/tracking`, `/benchmarks`, and paid APIs are protected
- `/checkout/return` and `/api/checkout-return-state` are public on purpose so Stripe can return to
  the app without depending on a fresh Clerk browser handshake
- public checkout return status still does not unlock features by itself; entitlements remain
  webhook-gated and server-enforced

## Billing Model

The MVP is `B2B only`.

- Auth: Clerk
- Checkout: Stripe-hosted Checkout Sessions in sandbox
- Billing mode: subscriptions with seat quantity
- Activation: Stripe webhook gated, not redirect gated
- Persistence: Postgres

This means a real Clerk app and one Postgres database are required even for a truthful local end to
end smoke.

Default sandbox prices are already wired in code for the connected Stripe sandbox account. Override
them with env vars if you want to use a different Stripe account.

## Local Setup

Requirements:

- Node.js 22 LTS or newer
- npm
- YouTube Data API v3 key
- Clerk application
- Stripe sandbox account
- Postgres database

Install:

```bash
npm install
copy .env.example .env.local
```

Fill `.env.local`:

```bash
YOUTUBE_API_KEY=your_youtube_data_api_key_here
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgres://...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Optional Stripe price overrides:

```bash
STRIPE_TEAM_MONTHLY_PRICE_ID=price_...
STRIPE_TEAM_ANNUAL_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID=price_...
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Forward Stripe webhooks in another terminal:

```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

Copy the emitted signing secret into `STRIPE_WEBHOOK_SECRET`.

## Stripe Sandbox Catalog

The current sandbox catalog matches the domain catalog:

- `Team Pulse`
  - monthly: `$49 / seat / month`
  - annual: `$39 / seat / month`, billed yearly
- `Enterprise Benchmarking`
  - monthly: `$99 / seat / month`
  - annual: `$79 / seat / month`, billed yearly

Default fallback Stripe price ids in this repo:

- `price_1TG2wuA0RuhjBcddsSXJYpWn` team monthly
- `price_1TG2wvA0RuhjBcddkRyXC5ef` team annual
- `price_1TG2wwA0RuhjBcddhIefAcTT` enterprise monthly
- `price_1TG2wyA0RuhjBcddUlzikinv` enterprise annual

## Persistence

Commercial MVP tables are auto-created on first Postgres access:

- `commercial_accounts`
- `saved_reports`
- `tracked_channels`
- `processed_webhook_events`

This repo does not yet use a dedicated migration framework. That is documented as production
follow-up in [docs/production-readiness.md](docs/production-readiness.md).

## Useful Checks

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

## Smoke Checklist

- visit `/` and confirm signed-out users are redirected to Clerk sign-in
- sign in or sign up
- analyze `https://www.youtube.com/@MKBHD`
- filter and sort the shortlist
- export CSV
- save a current-session snapshot
- confirm durable reports, weekly tracking, and benchmarks stay locked pre-checkout
- open the pricing drawer and start Stripe sandbox checkout
- complete checkout with a Stripe test card
- confirm the app returns to `/checkout/return?session_id=...`
- confirm the return page resolves billing state without requiring a second sign-in
- confirm webhook delivery changes billing state and unlocks paid workflows

## Legal And Accessibility

The repo includes placeholder pages for:

- `Terms`
- `Privacy`
- `Accessibility`
- `Copyright`
- `Legal Notice`

These pages describe the current B2B MVP shape, but they still require operator details, retention
rules, and production legal review before launch.

## TDD Notes

This implementation includes fresh regression coverage for:

- checkout drawer keyboard/focus behavior
- checkout route auth/origin/webhook handling
- Stripe price resolution and checkout session mapping
- billing state transitions and idempotent webhook replay
- paid workflow entitlement gates

The current turn includes real red-green evidence for the drawer regression fix. The broader Stripe
and paid workflow refactor was continued from an in-progress branch, so strict historical TDD
cannot be honestly claimed for every file touched in the branch.

## Production Follow-Up

See [docs/production-readiness.md](docs/production-readiness.md) for:

- what is in MVP now
- what still needs to happen before production
- which business, legal, and operational decisions remain open

## Authors

- OpenAI Codex
