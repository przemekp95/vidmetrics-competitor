import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Accessibility | VidMetrics Competitor Pulse",
  description:
    "Accessibility statement for the VidMetrics Competitor Pulse signed-in B2B MVP.",
};

export default function AccessibilityPage() {
  return (
    <LegalPageShell
      eyebrow="Accessibility"
      title="Accessibility Statement"
      summary="This statement describes the accessibility fixes completed in the MVP, the remaining audit gap, and what still needs to happen before claiming full compliance."
    >
      <section>
        <h2>1. Current scope</h2>
        <p>
          VidMetrics Competitor Pulse is a signed-in B2B MVP. The current accessibility pass
          focuses on keyboard and screen-reader behavior in the Stripe sandbox checkout flow,
          announcement of async status messages, visible affordances for key links, and stronger
          non-text contrast for interactive borders.
        </p>
      </section>

      <section>
        <h2>2. Fixes included in this MVP</h2>
        <ul>
          <li>The checkout drawer now moves focus on open, traps `Tab` and `Shift+Tab`, closes on `Escape`, and restores focus on close.</li>
          <li>The close button has an accessible name and the drawer exposes descriptive text via `aria-describedby`.</li>
          <li>Error states in the checkout drawer and workspace are announced with alert or live-region semantics.</li>
          <li>Interactive borders use a stronger contrast token than decorative separators.</li>
          <li>Key content links now expose visible underline affordances instead of inheriting plain text styling.</li>
        </ul>
      </section>

      <section>
        <h2>3. Known limits</h2>
        <p>
          These changes address the critical issues identified during the MVP pass, but they do not
          constitute a full repository-wide WCAG audit. Additional browser testing, assistive
          technology testing, content review, and production accessibility governance are still
          required before any full compliance claim.
        </p>
      </section>

      <section>
        <h2>4. Production follow-up</h2>
        <ul>
          <li>Run a broader audit across the signed-in flows, legal pages, and future billing-management surfaces.</li>
          <li>Validate with screen readers and keyboard-only passes in production browsers.</li>
          <li>Document an accessibility contact channel and issue response process.</li>
          <li>Re-test after any future work on account management, seat provisioning, or customer portal flows.</li>
        </ul>
      </section>

      <section>
        <h2>5. Contact</h2>
        <p>
          Replace this placeholder before production launch with the final accessibility contact:
          `[accessibility email or support contact]`.
        </p>
      </section>
    </LegalPageShell>
  );
}
