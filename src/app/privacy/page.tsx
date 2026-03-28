import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Privacy Policy | VidMetrics Competitor Pulse",
  description: "Privacy policy template for the VidMetrics Competitor Pulse MVP deployment.",
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Privacy"
      title="Privacy Policy"
      summary="This policy explains the categories of data processed in the signed-in MVP, why the data is used, and which production privacy decisions still need to be finalized."
    >
      <section>
        <h2>1. Scope</h2>
        <p>
          This page is a template privacy notice for the current signed-in MVP deployment of
          VidMetrics Competitor Pulse. It should be reviewed and completed with final operator
          details, retention periods, and processor disclosures before a production launch.
        </p>
      </section>

      <section>
        <h2>2. Categories of data</h2>
        <ul>
          <li>Public YouTube channel URLs pasted into the workspace.</li>
          <li>
            Clerk account identifiers and basic profile details such as user id, primary email, and
            display name.
          </li>
          <li>
            Stripe sandbox billing identifiers such as customer ids, subscription ids, checkout
            session ids, and related webhook event ids.
          </li>
          <li>
            Durable saved reports, tracked channels, and billing status records stored in Postgres
            for signed-in accounts.
          </li>
          <li>
            Browser-session identifiers used only to scope temporary current-session snapshots.
          </li>
          <li>
            Basic operational logs needed to diagnose errors, abuse, or quota-related incidents.
          </li>
        </ul>
      </section>

      <section>
        <h2>3. Why the data is used</h2>
        <ul>
          <li>To analyze public competitor video performance for the active month.</li>
          <li>To authenticate signed-in users and protect account-level routes.</li>
          <li>To maintain temporary snapshots during the current browser session.</li>
          <li>To create Stripe sandbox subscription checkouts and reconcile billing state via webhooks.</li>
          <li>To persist durable reports and tracked channels after paid activation.</li>
          <li>To monitor service reliability, request failures, and operational misuse.</li>
        </ul>
      </section>

      <section>
        <h2>4. Lawful basis and operator review</h2>
        <p>
          Before production launch, the operator should confirm the lawful basis for each processing
          purpose and document it in final legal text. A likely starting point for a B2B launch is
          legitimate interests for product operation and pre-contract steps for enterprise sales
          follow-up, but this must be validated by counsel.
        </p>
      </section>

      <section>
        <h2>5. Retention</h2>
        <ul>
          <li>Current-session snapshots are temporary and may be cleared by the user or on session loss.</li>
          <li>
            Account-level billing state, durable reports, and tracked channels currently persist
            until the operator defines a finalized retention policy.
          </li>
          <li>
            Webhook event ids are stored for idempotency and should be retained only as long as
            needed to prevent replay side effects.
          </li>
          <li>
            Operational logs should be retained for a short, documented period and reviewed before
            launch.
          </li>
        </ul>
      </section>

      <section>
        <h2>6. Sharing and processors</h2>
        <p>
          The deployed MVP may rely on infrastructure providers and APIs such as Clerk, Stripe,
          Vercel, the configured Postgres provider, and YouTube Data API v3. A production
          deployment should publish the final list of processors, international transfer details,
          subprocessor list, and contact channels for data subject requests.
        </p>
      </section>

      <section>
        <h2>7. Contact</h2>
        <p>
          Replace this placeholder with the final controller notice before production launch:
          `[Legal entity name]`, `[postal address]`, `[privacy email]`, `[DPO or privacy contact if
          applicable]`.
        </p>
      </section>
    </LegalPageShell>
  );
}
