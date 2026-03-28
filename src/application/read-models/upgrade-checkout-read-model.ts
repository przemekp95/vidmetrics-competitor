import type {
  BillingCycleValue,
  CheckoutStatus,
  FeatureEntitlement,
  PlanId,
} from "@/domain/commercial-upgrade/types";

export type UpgradeCheckoutReadModel = {
  status: CheckoutStatus;
  planId: PlanId | null;
  planLabel: string | null;
  billingCycle: BillingCycleValue | null;
  seats: number | null;
  displayPrice: string | null;
  includedFeatures: string[];
  entitlements: FeatureEntitlement[];
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  checkoutSessionId: string | null;
  checkoutCompletedAt: string | null;
  lastPaidAt: string | null;
};
