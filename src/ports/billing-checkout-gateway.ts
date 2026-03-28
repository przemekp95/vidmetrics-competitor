import type { PlanSelection } from "@/domain/commercial-upgrade/plan-selection";
import type { BillingLifecycleEvent } from "@/domain/commercial-upgrade/types";

export interface BillingCheckoutGateway {
  createSubscriptionCheckout(input: {
    userId: string;
    email: string;
    name: string | null;
    selection: PlanSelection;
    existingStripeCustomerId: string | null;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{
    checkoutSessionId: string;
    checkoutUrl: string;
    stripeCustomerId: string;
  }>;
}

export interface BillingWebhookVerifier {
  verifyAndParse(payload: string, signature: string | null): Promise<BillingLifecycleEvent | null>;
}
