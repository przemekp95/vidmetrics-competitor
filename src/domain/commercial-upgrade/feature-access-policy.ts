import type { CheckoutStatus, FeatureEntitlement } from "@/domain/commercial-upgrade/types";

const paidEntitlements: FeatureEntitlement[] = [
  "durable_reports",
  "weekly_tracking",
  "multi_channel_benchmarks",
];

export class FeatureAccessPolicy {
  static getEntitlements(status: CheckoutStatus): FeatureEntitlement[] {
    return status === "active" ? [...paidEntitlements] : [];
  }

  static hasEntitlement(
    status: CheckoutStatus,
    entitlement: FeatureEntitlement,
  ) {
    return this.getEntitlements(status).includes(entitlement);
  }
}
