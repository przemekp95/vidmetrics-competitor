import { CommercialFeaturePageShell } from "@/components/commercial-feature-page-shell";
import { TrackedChannelsRouteView } from "@/components/tracked-channels-route-view";

export default function TrackingPage() {
  return (
    <CommercialFeaturePageShell
      eyebrow="Weekly Tracking"
      title="Tracked channels"
      summary="This page shows the paid weekly-tracking list. Use the main workspace to refresh a tracked channel from the current live analysis."
    >
      <TrackedChannelsRouteView />
    </CommercialFeaturePageShell>
  );
}
