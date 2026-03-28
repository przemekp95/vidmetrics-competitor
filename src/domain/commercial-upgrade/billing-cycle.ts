import { ApplicationError } from "@/shared/application-error";
import type { BillingCycleValue } from "@/domain/commercial-upgrade/types";

export class BillingCycle {
  private constructor(private readonly value: BillingCycleValue) {}

  static create(value: string) {
    if (value !== "monthly" && value !== "annual") {
      throw new ApplicationError(
        "INVALID_BILLING_CYCLE",
        `Billing cycle ${value} is not supported.`,
        400,
        "Choose a valid billing cycle.",
      );
    }

    return new BillingCycle(value);
  }

  toValue(): BillingCycleValue {
    return this.value;
  }

  isAnnual() {
    return this.value === "annual";
  }
}
