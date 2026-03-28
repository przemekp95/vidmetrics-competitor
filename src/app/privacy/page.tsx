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
      summary="This policy explains the categories of data the MVP may process, why the data is used, and what still needs to be finalized before a real launch."
    >
      <section>
        <h2>1. Scope</h2>
        <p>
          This page is a template privacy notice for the current MVP deployment of VidMetrics
          Competitor Pulse. It should be reviewed and completed with final operator details before
          a production launch.
        </p>
      </section>

      <section>
        <h2>2. Categories of data</h2>
        <ul>
          <li>Public YouTube channel URLs pasted into the workspace.</li>
          <li>
            Browser-session identifiers used to scope temporary snapshots and mock checkout state.
          </li>
          <li>
            Mock checkout data entered by the user, including buyer name, buyer email, and company
            name.
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
          <li>To maintain temporary snapshots during the current browser demo session.</li>
          <li>To simulate an enterprise upgrade flow that ends in pending activation.</li>
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
          <li>Snapshot and mock checkout state are temporary and may be cleared on restart.</li>
          <li>
            Session identifiers should be retained only as long as needed to run the active
            browser-session workflow.
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
          The deployed MVP may rely on infrastructure providers and APIs such as Vercel and YouTube
          Data API v3. A production deployment should publish the final list of processors,
          international transfer details, and contact channels for data subject requests.
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
