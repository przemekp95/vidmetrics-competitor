import { Suspense } from "react";

import { CheckoutReturnStatus } from "@/components/checkout-return-status";
import { CommercialFeaturePageShell } from "@/components/commercial-feature-page-shell";

export default function CheckoutReturnPage() {
  return (
    <CommercialFeaturePageShell
      eyebrow="Stripe sandbox"
      title="Checkout return"
      summary="This page reflects the post-checkout account state. Access remains locked until the Stripe webhook confirms the subscription billing outcome."
    >
      <Suspense
        fallback={
          <section className="rounded-4xl border border-(--color-border) bg-white/90 p-6 text-sm text-(--color-muted) shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
            Loading billing state...
          </section>
        }
      >
        <CheckoutReturnStatus />
      </Suspense>
    </CommercialFeaturePageShell>
  );
}
