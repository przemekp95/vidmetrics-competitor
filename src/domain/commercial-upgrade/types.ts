export type PlanId = "team" | "enterprise";

export type BillingCycleValue = "monthly" | "annual";

export type CheckoutStatus = "draft" | "submitted";

export type CommercialPlan = {
  planId: PlanId;
  label: string;
  minSeats: number;
  maxSeats: number;
  monthlyPricePerSeat: number;
  annualPricePerSeat: number;
  includedFeatures: string[];
};

export type CheckoutIntentSummary = {
  status: CheckoutStatus;
  planId: PlanId;
  planLabel: string;
  billingCycle: BillingCycleValue;
  seats: number;
  displayPrice: string;
  includedFeatures: string[];
  buyerName: string | null;
  buyerEmail: string | null;
  companyName: string | null;
  submittedAt: string | null;
  confirmationCode: string | null;
};
