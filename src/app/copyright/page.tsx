import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Copyright & Data Sources | VidMetrics Competitor Pulse",
  description:
    "Copyright, attribution, and public data source notice for the VidMetrics Competitor Pulse MVP.",
};

export default function CopyrightPage() {
  return (
    <LegalPageShell
      eyebrow="Copyright"
      title="Copyright & Data Sources"
      summary="This page clarifies ownership of the app, treatment of third-party marks, and the fact that the MVP works on public source data rather than private creator analytics."
    >
      <section>
        <h2>1. App materials</h2>
        <p>
          Unless stated otherwise, the source code, product copy, visual design, and UI assets for
          VidMetrics Competitor Pulse belong to the operator of the service. Replace this sentence
          with the final ownership notice before production launch.
        </p>
      </section>

      <section>
        <h2>2. Third-party marks and platforms</h2>
        <p>
          YouTube and any creator, publisher, or media brand names referenced in the product remain
          the property of their respective owners. Their appearance in the MVP is for analysis,
          identification, and interoperability with public channel data only.
        </p>
      </section>

      <section>
        <h2>3. Public data sourcing</h2>
        <ul>
          <li>The service uses public YouTube metadata and public engagement counters.</li>
          <li>
            The service does not claim ownership over creator videos, thumbnails, titles, or public
            channel identity assets.
          </li>
          <li>
            Ranking and trend labels are derived by the app from public data and should not be read
            as official platform endorsements.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Reuse and redistribution</h2>
        <p>
          Before production launch, the operator should define what downstream reuse is permitted
          for exports, screenshots, and generated client reports. If redistribution limits apply,
          they should be stated here in the final version.
        </p>
      </section>

      <section>
        <h2>5. IP complaints and notices</h2>
        <p>
          Replace this placeholder with the final channel for copyright, trademark, or takedown
          notices: `[IP contact email]`, `[postal address]`.
        </p>
      </section>
    </LegalPageShell>
  );
}
