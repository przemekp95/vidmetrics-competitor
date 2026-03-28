import { CommercialFeaturePageShell } from "@/components/commercial-feature-page-shell";
import { SavedReportsRouteView } from "@/components/saved-reports-route-view";

export default function ReportsPage() {
  return (
    <CommercialFeaturePageShell
      eyebrow="Saved Reports"
      title="Durable reports"
      summary="This page shows account-level saved reports unlocked after webhook-confirmed Stripe activation. Use the main workspace to save the current analysis into this library."
    >
      <SavedReportsRouteView />
    </CommercialFeaturePageShell>
  );
}
