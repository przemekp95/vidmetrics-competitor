import type {
  BillingCycleValue,
  CheckoutStatus,
  PlanId,
} from "@/domain/commercial-upgrade/types";

export type UpgradeCheckoutReadModel = {
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
