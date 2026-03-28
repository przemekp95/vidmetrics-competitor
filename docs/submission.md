# VidMetrics Competitor Pulse Submission Notes

## What Was Built

This repo now reflects a signed-in B2B MVP rather than a mock-checkout demo:

- competitor YouTube analysis for the active month
- free current-session snapshots and CSV export
- Clerk-authenticated workspace on `/` and protected paid routes
- Stripe sandbox subscription checkout with seat-based pricing
- webhook-driven billing activation
- paid account workflows for durable reports, weekly tracking, and multi-channel benchmarks

## Architecture

### CQRS

- query side: analyze competitor channels, list checkout state, list checkout return state by Stripe
  session id, list saved reports, list tracked channels
- command side: save session snapshots, start Stripe checkout, apply Stripe webhook events, save durable reports, save tracked channels
- the query/read model surfaces stay separate from the domain model, especially for presentation-only fields

### DDD

- `analysis` and `commercial-upgrade` are separate bounded contexts
- the domain keeps ranking, trend, summary, billing lifecycle, and entitlement rules
- app handlers orchestrate use cases and repositories
- Stripe, Clerk, Postgres, and YouTube integrations are adapters behind ports

This is still a pragmatic DDD slice, not a maximalist domain model. The repo preserves useful
boundaries without introducing heavyweight infrastructure patterns for their own sake.

### OOP And Hexagonal Boundaries

- `CommercialAccount` is the central aggregate for billing state and entitlements
- `FeatureAccessPolicy` owns entitlement decisions
- command and query handlers depend on repository and gateway ports
- HTTP route handlers remain thin and do not own billing or authorization rules

### Messaging Boundary

- Stripe webhooks are the async messaging boundary for billing activation
- webhook payloads are verified, normalized into internal lifecycle events, and applied idempotently
- processed event ids are persisted to prevent replay side effects
- `/checkout/return` is public, but it only reads a billing projection keyed by `checkoutSessionId`
  and does not grant access on redirect alone

## TDD Status

Fresh tests were added for:

- drawer keyboard/focus behavior
- checkout routes
- Stripe billing gateway price resolution
- billing lifecycle transitions and idempotent webhook replay
- paid workflow entitlement gates

Strict red-green evidence exists for the final drawer regression fix in this turn. The broader
commercial refactor was resumed from an in-progress branch, so full historical TDD cannot be
proven for every earlier implementation step.

## Security And Transport Conclusions

### What Is Already In Place

- Clerk-backed authentication for the workspace and paid routes
- signed-out requests to `/` are intentionally redirected to Clerk because the homepage is the main
  protected workspace
- per-route auth checks inside handlers
- same-origin checks on browser-triggered POST routes
- Stripe signature verification on the webhook route
- server-side entitlements for durable reports, weekly tracking, and benchmarks
- idempotent webhook processing
- public post-checkout polling route keyed by Stripe `session_id`, used only to survive cross-origin
  return before Clerk fully re-synchronizes on localhost/dev

### What Is Still Missing Before Production

- CSP, `nosniff`, frame protection, and stricter browser hardening headers
- durable shared rate limiting for public quota-consuming flows
- production incident monitoring and alerting
- finalized retention and deletion rules
- live-mode billing operations, tax/VAT, refund handling, and customer portal

## Product Limits

Current MVP limits are intentional:

- one analyzed channel at a time
- no historical benchmark time series
- no automated weekly cron refresh
- no full multi-user seat provisioning
- no customer self-serve billing management

These limits keep the MVP thin while still proving the commercial path end to end.

## Deployment And Smoke

Production URL:

- `https://vidmetrics-competitor.vercel.app`

Recommended smoke:

1. open `/` and confirm signed-out users are redirected to Clerk sign-in
2. sign in
3. analyze `@MKBHD`
4. export CSV and save a current-session snapshot
5. confirm paid workflows are locked
6. start Stripe sandbox checkout
7. complete the hosted checkout with a test card
8. verify the app lands on `/checkout/return?session_id=...` without a second sign-in
9. verify webhook delivery changes billing state and unlocks paid workflows

## Production Docs

Production follow-up and open decisions live in [docs/production-readiness.md](docs/production-readiness.md).
