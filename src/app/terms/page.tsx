import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Use | VidMetrics Competitor Pulse",
  description: "Terms of use template for the VidMetrics Competitor Pulse MVP deployment.",
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Terms"
      title="Terms of Use"
      summary="These terms are written for the current MVP demo and should be finalized with operator details, governing law, and production controls before launch."
    >
      <section>
        <h2>1. Demo status</h2>
        <p>
          VidMetrics Competitor Pulse is currently presented as an MVP demo environment. The
          checkout flow is mocked, activation is simulated, and no real billing or seat
          provisioning occurs in the current deployment.
        </p>
      </section>

      <section>
        <h2>2. Intended audience</h2>
        <p>
          This template assumes a business-to-business workflow for media teams, publishers, and
          agencies. If the product is later offered directly to consumers, the final operator must
          update these terms and any pre-contract information accordingly.
        </p>
      </section>

      <section>
        <h2>3. Acceptable use</h2>
        <ul>
          <li>Use the service only for lawful research, benchmarking, and internal planning.</li>
          <li>Do not attempt to bypass request limits, abuse third-party APIs, or scrape protected data.</li>
          <li>Do not rely on the MVP for financial, legal, or regulatory decision-making.</li>
          <li>Do not misrepresent public competitor data as private or platform-certified analytics.</li>
        </ul>
      </section>

      <section>
        <h2>4. Public data and service limitations</h2>
        <ul>
          <li>The service uses public YouTube data only.</li>
          <li>Watch time, CTR, retention, impressions, and private creator analytics are unavailable.</li>
          <li>
            Analysis is capped per request and may be throttled or unavailable due to upstream API
            limits.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. No production warranty in this deployment</h2>
        <p>
          The current demo is provided on an as-is basis for evaluation. The operator should add
          final warranty disclaimers, limitation of liability language, and governing law clauses
          before production launch.
        </p>
      </section>

      <section>
        <h2>6. Changes and suspension</h2>
        <p>
          The operator may modify or suspend the MVP at any time while the product remains in demo
          or pre-production form.
        </p>
      </section>

      <section>
        <h2>7. Contact and operator details</h2>
        <p>
          Replace this placeholder before production launch: `[Legal entity name]`, `[registered
          address]`, `[support email]`, `[registration number / VAT if required]`.
        </p>
      </section>
    </LegalPageShell>
  );
}
