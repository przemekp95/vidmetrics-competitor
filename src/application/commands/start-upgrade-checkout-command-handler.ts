import type { CheckoutIntentRepository } from "@/ports/checkout-intent-repository";
import type { UpgradeCatalogProvider } from "@/ports/upgrade-catalog-provider";
import { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";
import type { PlanId } from "@/domain/commercial-upgrade/types";
import { UpgradeCatalogPolicy } from "@/domain/commercial-upgrade/upgrade-catalog-policy";

export function createStartUpgradeCheckoutCommandHandler({
  repository,
  catalogProvider,
}: {
  repository: CheckoutIntentRepository;
  catalogProvider: UpgradeCatalogProvider;
}) {
  return async function handleStartUpgradeCheckoutCommand(input: {
    sessionId: string;
    planId: PlanId;
    billingCycle: string;
    seats: number;
  }) {
    const catalog = await catalogProvider.getCatalog();
    const selection = new UpgradeCatalogPolicy(catalog).createSelection(input);
    const checkoutIntent = CheckoutIntent.start(selection);

    await repository.save(input.sessionId, checkoutIntent);

    return checkoutIntent;
  };
}
