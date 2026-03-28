import type { BillingCycle } from "@/domain/commercial-upgrade/billing-cycle";
import type { SeatCount } from "@/domain/commercial-upgrade/seat-count";
import type { CommercialPlan } from "@/domain/commercial-upgrade/types";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export class PlanSelection {
  constructor(
    private readonly plan: CommercialPlan,
    private readonly billingCycle: BillingCycle,
    private readonly seatCount: SeatCount,
  ) {}

  getPlanId() {
    return this.plan.planId;
  }

  getPlanLabel() {
    return this.plan.label;
  }

  getBillingCycle() {
    return this.billingCycle.toValue();
  }

  getSeats() {
    return this.seatCount.toValue();
  }

  getIncludedFeatures() {
    return [...this.plan.includedFeatures];
  }

  getDisplayPrice() {
    const pricePerSeat = this.billingCycle.isAnnual()
      ? this.plan.annualPricePerSeat
      : this.plan.monthlyPricePerSeat;
    const total = pricePerSeat * this.seatCount.toValue() * (this.billingCycle.isAnnual() ? 12 : 1);

    return `${usdFormatter.format(total)}/${this.billingCycle.isAnnual() ? "yr" : "mo"}`;
  }
}
