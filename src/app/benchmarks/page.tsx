import { BenchmarksRouteView } from "@/components/benchmarks-route-view";
import { CommercialFeaturePageShell } from "@/components/commercial-feature-page-shell";

export default function BenchmarksPage() {
  return (
    <CommercialFeaturePageShell
      eyebrow="Benchmarks"
      title="Multi-channel benchmarks"
      summary="Compare current summary metrics across up to three saved reports or tracked channels. This MVP uses current account data only, not historical time series."
    >
      <BenchmarksRouteView />
    </CommercialFeaturePageShell>
  );
}
