import { createStartUpgradeCheckoutCommandHandler } from "@/application/commands/start-upgrade-checkout-command-handler";
import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { createInMemoryCheckoutIntentRepository } from "@/infrastructure/commercial-upgrade/in-memory-checkout-intent-repository";
import { createStaticUpgradeCatalogProvider } from "@/infrastructure/commercial-upgrade/static-upgrade-catalog-provider";
import { createStartUpgradeCheckoutRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const repository = createInMemoryCheckoutIntentRepository();
const catalogProvider = createStaticUpgradeCatalogProvider();
const startUpgradeCheckoutCommandHandler = createStartUpgradeCheckoutCommandHandler({
  repository,
  catalogProvider,
});

export const POST = createStartUpgradeCheckoutRouteHandler({
  startCheckout: async (input) =>
    toUpgradeCheckoutReadModel(await startUpgradeCheckoutCommandHandler(input))!,
});
