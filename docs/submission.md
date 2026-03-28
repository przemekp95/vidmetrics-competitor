# VidMetrics Competitor Pulse Submission Notes

## Build Breakdown

This codebase reflects two phases:

- Initial MVP implementation of the competitor analysis dashboard.
- A hardening and architecture pass that added client-safe errors, query/command separation,
  browser-session snapshots, rate limiting, and explicit read-model mapping.

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
- auth, sharing, and team workflows

Version 2 priorities:

- durable snapshot storage and report history
- side-by-side channel comparison
- richer charting for cadence and engagement efficiency
- saved views and reusable filters
- automated refresh or scheduled snapshot capture

## Architecture Decisions

CQRS:

- query side: analyze competitor channel, list saved snapshots
- command side: save snapshot, clear current-session snapshots
- command persistence is intentionally non-durable in this iteration to protect demo scope

DDD:

- the domain keeps ranking, trend, and summary logic
- presentation-only fields such as `videoUrl`, `durationText`, and month labels are mapped outside
  the domain
- the code remains a pragmatic DDD slice rather than a full enterprise model

TDD:

- the new hardening work followed test-first changes for routes, handlers, mapping, and request
  guards
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

## Loom

Loom URL: pending recording before submission.

Recommended 5-minute walkthrough:

1. State the client problem and the Monday demo goal.
2. Show the main analyze flow from pasted channel URL to ranked results.
3. Show filters, chart, CSV export, and current-session snapshots.
4. Explain CQRS, domain mapping, and the request guard in one minute.
5. Close with tradeoffs, missing v2 items, and why the implementation stayed demo-first.
