import type { Metadata } from "next";

import { LegalPageShell } from "@/components/legal-page-shell";

export const metadata: Metadata = {
  title: "Legal Notice | VidMetrics Competitor Pulse",
  description: "Legal notice template for the VidMetrics Competitor Pulse MVP deployment.",
};

export default function LegalNoticePage() {
  return (
    <LegalPageShell
      eyebrow="Legal Notice"
      title="Legal Notice"
      summary="This page is a placeholder for the operator details that should be easy to find, direct, and continuously available before any commercial launch."
    >
      <section>
        <h2>1. Service operator</h2>
        <p>
          Replace before production launch: `[Legal entity name]`, `[registered office / geographic
          address]`, `[company registration number]`, `[VAT number if applicable]`.
        </p>
      </section>

      <section>
        <h2>2. Contact</h2>
        <p>
          Replace before production launch: `[general support email]`, `[legal email]`, `[phone or
          other direct contact channel if used by the business]`.
        </p>
      </section>

      <section>
        <h2>3. Product status</h2>
        <p>
          The current deployment is an MVP demo environment with mock activation, temporary
          session-scoped storage, and public-data-only YouTube analysis.
        </p>
      </section>

      <section>
        <h2>4. Hosting and infrastructure</h2>
        <p>
          Replace before production launch with the final list of material hosting and infrastructure
          providers if disclosure is required by the operator&apos;s chosen legal notices format.
        </p>
      </section>
    </LegalPageShell>
  );
}
