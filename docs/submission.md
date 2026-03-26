# VidMetrics Competitor Pulse Submission Notes

## Build Breakdown

This MVP was built as a greenfield Next.js 16 App Router application with Tailwind 4 styling.
The implementation is split into a lean hexagonal shape so the server-side YouTube integration stays
behind ports and adapters, while domain logic remains isolated from transport and UI concerns.

What was built:

- A public competitor analysis workspace with a polished SaaS layout.
- A server-side `POST /api/analyze` route that resolves a YouTube channel URL and returns a normalized analysis payload.
- A YouTube Data API adapter that loads public channel metadata, uploads, and video statistics.
- Domain logic for current-month filtering, momentum ranking, derived metrics, and trend labels.
- Responsive filtering, sorting, and CSV export for the analyzed video list.

## AI-Assisted Workflow

AI was used to move quickly across three areas:

- Scaffolding the Next.js application structure and dependency selection.
- Drafting and refining the analysis architecture, including the domain/application split.
- Producing the initial UI composition and documentation structure, then iterating against real build and test output.

The implementation still followed an evidence-first loop for the logic-heavy parts:

- Write tests for URL parsing, metric derivation, and route normalization.
- Run the tests and confirm a red state.
- Implement the smallest code needed to pass.
- Re-run the tests and then verify lint and production build output.

## Tradeoffs

- I used public YouTube metrics only. Competitor channels cannot expose owner-only data such as watch time, CTR, or retention.
- I chose a lean hexagonal structure instead of full enterprise DDD. The domain is real, but the product does not need heavy ceremony.
- The dashboard favors clarity and demo value over dense analytics depth. This keeps the Monday presentation strong without overbuilding.
- The URL resolver supports modern channel URL shapes first, with best-effort fallback for legacy custom URLs.

## What Is Missing

- No authentication or saved workspaces.
- No database or historical trend storage.
- No private-channel analytics, because the official competitor path does not provide them.
- No multi-channel comparison view yet.
- No scheduled refresh or background sync.
- No advanced charting beyond the current momentum summary.

## Version 2 Ideas

- Add saved reports and team sharing.
- Add historical snapshots so trends can be compared week over week.
- Add channel comparison mode for two or more competitors.
- Add narrative insights such as "fastest risers" and "format mix".
- Add richer charts for upload cadence, engagement efficiency, and month-over-month movement.
- Add better URL intelligence and channel discovery when users paste non-canonical links.

## 5-Minute Loom Outline

0:00-0:30 - State the goal: a fast competitor analysis MVP for client demos.

0:30-1:30 - Walk through the homepage, URL input, and the public-metrics constraint.

1:30-2:30 - Show the analysis results: summary cards, momentum chart, filters, and sortable table.

2:30-3:30 - Demonstrate CSV export and responsive behavior on a smaller viewport.

3:30-4:15 - Explain the architecture: Next.js App Router, server-side YouTube adapter, domain logic, and lean hexagonal boundaries.

4:15-5:00 - Close with tradeoffs, what is missing, and the strongest v2 opportunities.
