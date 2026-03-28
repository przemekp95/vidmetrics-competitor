import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { UpgradeCatalogProvider } from "@/ports/upgrade-catalog-provider";
import type { BillingCheckoutGateway } from "@/ports/billing-checkout-gateway";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { PlanId } from "@/domain/commercial-upgrade/types";
import { UpgradeCatalogPolicy } from "@/domain/commercial-upgrade/upgrade-catalog-policy";

export function createStartUpgradeCheckoutCommandHandler({
  repository,
  catalogProvider,
  billingCheckoutGateway,
}: {
  repository: CommercialSubscriptionRepository;
  catalogProvider: UpgradeCatalogProvider;
  billingCheckoutGateway: BillingCheckoutGateway;
}) {
  return async function handleStartUpgradeCheckoutCommand(input: {
    userId: string;
    email: string;
    name: string | null;
    planId: PlanId;
    billingCycle: string;
    seats: number;
    successUrl: string;
    cancelUrl: string;
  }) {
    const catalog = await catalogProvider.getCatalog();
    const selection = new UpgradeCatalogPolicy(catalog).createSelection(input);
    const existingAccount =
      (await repository.getByUserId(input.userId)) ?? CommercialAccount.create(input.userId);
    const checkoutSession = await billingCheckoutGateway.createSubscriptionCheckout({
      userId: input.userId,
      email: input.email,
      name: input.name,
      selection,
      existingStripeCustomerId: existingAccount.getStripeCustomerId(),
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });
    const account = existingAccount.beginCheckout({
      selection,
      stripeCustomerId: checkoutSession.stripeCustomerId,
      checkoutSessionId: checkoutSession.checkoutSessionId,
    });

    await repository.save(account);

    return {
      account,
      checkoutUrl: checkoutSession.checkoutUrl,
    };
  };
}
