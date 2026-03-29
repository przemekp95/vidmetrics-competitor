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
          <section className="neon-panel rounded-[34px] p-6 text-sm neon-muted-copy">
            Loading billing state...
          </section>
        }
      >
        <CheckoutReturnStatus />
      </Suspense>
    </CommercialFeaturePageShell>
  );
}
