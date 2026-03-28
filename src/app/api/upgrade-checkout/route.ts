import { createGetCheckoutStateQueryHandler } from "@/application/queries/get-checkout-state-query-handler";
import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { createInMemoryCheckoutIntentRepository } from "@/infrastructure/commercial-upgrade/in-memory-checkout-intent-repository";
import { createGetUpgradeCheckoutRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const repository = createInMemoryCheckoutIntentRepository();
const getCheckoutStateQueryHandler = createGetCheckoutStateQueryHandler({ repository });

export const GET = createGetUpgradeCheckoutRouteHandler({
  getCheckoutState: async ({ sessionId }) =>
    toUpgradeCheckoutReadModel(await getCheckoutStateQueryHandler({ sessionId })),
});
