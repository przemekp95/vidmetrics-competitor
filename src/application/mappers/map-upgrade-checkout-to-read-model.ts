import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import type { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";

export function toUpgradeCheckoutReadModel(
  account: CommercialAccount | null,
): UpgradeCheckoutReadModel | null {
  if (!account) {
    return null;
  }

  return account.toSummary();
}
