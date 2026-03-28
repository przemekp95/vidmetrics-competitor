import { createConfirmUpgradeCheckoutCommandHandler } from "@/application/commands/confirm-upgrade-checkout-command-handler";
import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { createInMemoryCheckoutIntentRepository } from "@/infrastructure/commercial-upgrade/in-memory-checkout-intent-repository";
import { createConfirmUpgradeCheckoutRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const repository = createInMemoryCheckoutIntentRepository();
const confirmUpgradeCheckoutCommandHandler = createConfirmUpgradeCheckoutCommandHandler({
  repository,
});

export const POST = createConfirmUpgradeCheckoutRouteHandler({
  confirmCheckout: async (input) =>
    toUpgradeCheckoutReadModel(await confirmUpgradeCheckoutCommandHandler(input))!,
});
