export type PlanId = "team" | "enterprise";

export type BillingCycleValue = "monthly" | "annual";

export type CheckoutStatus = "draft" | "checkout_pending" | "pending_payment" | "active" | "past_due" | "canceled";

export type FeatureEntitlement =
  | "durable_reports"
  | "weekly_tracking"
  | "multi_channel_benchmarks";

export type CommercialPlan = {
  planId: PlanId;
  label: string;
  minSeats: number;
  maxSeats: number;
  monthlyPricePerSeat: number;
  annualPricePerSeat: number;
  includedFeatures: string[];
};

export type CommercialAccountSummary = {
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

export type BillingLifecycleEvent =
  | {
      type: "checkout_session_completed";
      eventId: string;
      userId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string | null;
      checkoutSessionId: string;
      occurredAt: string;
    }
  | {
      type: "invoice_paid";
      eventId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string | null;
      occurredAt: string;
    }
  | {
      type: "invoice_payment_failed";
      eventId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string | null;
      occurredAt: string;
    }
  | {
      type: "subscription_updated";
      eventId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      status: "active" | "past_due" | "canceled";
      occurredAt: string;
    }
  | {
      type: "subscription_deleted";
      eventId: string;
      stripeCustomerId: string;
      stripeSubscriptionId: string;
      occurredAt: string;
    };
