import { createStartUpgradeCheckoutCommandHandler } from "@/application/commands/start-upgrade-checkout-command-handler";
import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createStartUpgradeCheckoutRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const { commercialSubscriptionRepository, catalogProvider, billingCheckoutGateway } =
  getCommercialRuntime();
const startUpgradeCheckoutCommandHandler = createStartUpgradeCheckoutCommandHandler({
  repository: commercialSubscriptionRepository,
  catalogProvider,
  billingCheckoutGateway,
});

export const POST = createStartUpgradeCheckoutRouteHandler({
  startCheckout: async (input) => {
    const result = await startUpgradeCheckoutCommandHandler(input);

    return {
      checkout: toUpgradeCheckoutReadModel(result.account)!,
      checkoutUrl: result.checkoutUrl,
    };
  },
  getAuthenticatedUser: async () => getAuthenticatedUser(),
});
