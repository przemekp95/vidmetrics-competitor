import type { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";
import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";

export function toUpgradeCheckoutReadModel(
  checkoutIntent: CheckoutIntent | null,
): UpgradeCheckoutReadModel | null {
  if (!checkoutIntent) {
    return null;
  }

  return checkoutIntent.toSummary();
}
