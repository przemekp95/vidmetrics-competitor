# Production Readiness

## MVP Now

- Clerk-authenticated workspace with `proxy.ts` protection for app and API routes
- homepage `/` is the protected workspace, so signed-out document requests redirect to Clerk
- Stripe-hosted sandbox Checkout Sessions for seat-based subscriptions
- webhook-gated billing activation
- public `/checkout/return` page plus `/api/checkout-return-state` read route keyed by Stripe
  `session_id`, used to survive cross-origin return before Clerk browser sync settles
- Postgres persistence for commercial accounts, durable reports, tracked channels, and processed webhook events
- free current-session snapshots kept separate from durable paid storage
- accessibility fixes for the checkout drawer, status messages, visible link affordances, and interactive border contrast

## Production Later

- switch from Stripe sandbox to live mode
- tax and VAT handling
- customer portal and subscription self-service
- Clerk orgs or real seat assignment and invitation flow
- durable shared rate limiting instead of process-local protection only
- security headers and CSP baseline
- monitoring, alerting, and incident playbooks
- formal migration workflow instead of lazy schema creation
- full accessibility audit across the repo and post-launch regression process
- review whether the public `session_id` return-state route remains the desired production shape or
  should be replaced by a tighter signed handoff pattern on the deployed domain

## Decisions / External Inputs

- operator legal identity and contact details
- privacy lawful basis wording
- retention periods for reports, tracking data, and logs
- processor and subprocessor list
- refund and cancellation policy
- whether the product remains `B2B only` or ever enters B2C scope
- whether full org-based seat management is required
- accessibility contact channel and escalation process
