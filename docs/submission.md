# VidMetrics Competitor Pulse Submission Notes

## Build Breakdown

This codebase reflects two phases:

- Initial MVP implementation of the competitor analysis dashboard.
- A hardening and architecture pass that added client-safe errors, query/command separation,
  browser-session snapshots, rate limiting, and explicit read-model mapping.
- A SaaS workflow pass that added a product shell, gated workflow surfaces, and a mock enterprise
  checkout bounded context.

Tracked time in the hardening pass was roughly 2 hours including implementation, verification,
deployment repair, and live smoke testing. The original MVP build time was not instrumented closely
 enough in-repo to claim a precise historical duration.

Tools and frameworks used:

- Next.js 16 App Router
- React 19
- Tailwind 4
- Vitest
- Playwright MCP for browser verification
- Vercel CLI / Vercel deployment
- YouTube Data API v3
- OpenAI Codex for scaffolding, refactor acceleration, and verification loops

What was accelerated or automated:

- scaffolding and refactor slicing
- route and mapper generation
- test drafting for the new query/command behavior
- browser smoke verification against the deployed app

What was kept manual:

- architecture decisions and tradeoffs
- final UI shaping
- error handling and operator-safe messaging
- live deployment validation

## Product Thinking

What still feels missing:

- durable persistence for saved reports
- multi-channel comparison
- historical snapshots across weeks or months
- richer narrative insights on why a video is trending
- auth, sharing, and real team workflows
- real billing and provisioning behind the mock checkout surface

Version 2 priorities:

- durable snapshot storage and report history
- side-by-side channel comparison
- richer charting for cadence and engagement efficiency
- saved views and reusable filters
- automated refresh or scheduled snapshot capture
- auth, seat management, and real billing integration
- finalized legal copy with operator details and counsel-reviewed production policies

Current MVP operating limits:

- a single analysis request considers at most `100` public uploads from the active month
- this cap is intentional for demo responsiveness and YouTube API quota discipline

## Architecture Decisions

CQRS:

- query side: analyze competitor channel, list saved snapshots, get upgrade checkout state
- command side: save snapshot, clear current-session snapshots, start checkout, confirm checkout
- command persistence is intentionally non-durable in this iteration to protect demo scope and keep
  the MVP demo-safe

DDD:

- the domain keeps ranking, trend, and summary logic
- the new `commercial-upgrade` bounded context uses OOP-first aggregates and value objects:
  `CheckoutIntent`, `PlanSelection`, `SeatCount`, `BuyerProfile`, `CompanyProfile`
- presentation-only fields such as `videoUrl`, `durationText`, and month labels are mapped outside
  the domain
- the code remains a pragmatic DDD slice rather than a full enterprise model

TDD:

- the new hardening work followed test-first changes for routes, handlers, mapping, and request
  guards
- the mock checkout workflow also followed test-first changes for domain rules, command/query
  handlers, transport, and one component flow
- the earlier greenfield MVP commits do not provide enough granularity to prove full historical TDD

## Deployment And Smoke

Production URL:

- `https://vidmetrics-competitor.vercel.app`

Smoke checklist:

- homepage desktop
- homepage mobile
- analyze `@MKBHD`
- filter and sort
- CSV export
- save snapshot
- list current-session snapshots
- clear current-session snapshots
- open pricing drawer
- start checkout draft
- submit checkout
- verify `Pending activation`

## Security Conclusions

Current posture:

- good enough for an investor or client demo
- not sufficient for a real public production API

Why:

- `/api/analyze` is publicly callable and consumes YouTube API quota
- current rate limiting is in-memory and per-process, so it does not hold across cold starts or
  multiple instances
- session-scoped snapshot and checkout routes use a browser-generated session id, not real auth
- app-level browser hardening headers still need a stronger baseline

What is already in place:

- runtime request validation with Zod
- sanitized public error messages
- HTTPS in production
- a pragmatic CQRS and ports-and-adapters split that keeps transport and anti-abuse logic outside
  the domain

What should happen before a real production launch:

- move rate limiting to a shared durable layer
- replace browser-generated session ids with server-managed or signed sessions
- add security headers such as CSP, frame protection, `nosniff`, and referrer policy
- add explicit origin and CSRF protections if cookie-based auth is introduced later
- replace the demo legal pages with finalized operator-specific terms, privacy, copyright, and
  legal notice content

## Loom

Loom URL: pending recording before submission.

Recommended 5-minute walkthrough:

1. State the client problem and the Monday demo goal.
2. Show the main analyze flow from pasted channel URL to ranked results.
3. Show filters, chart, CSV export, current-session snapshots, and the gated SaaS workflow cards.
4. Walk through the mock checkout and the `Pending activation` state.
5. Explain CQRS, the commercial-upgrade bounded context, and the request guard in one minute.
6. Close with tradeoffs, missing v2 items, and why the implementation stayed demo-first.
