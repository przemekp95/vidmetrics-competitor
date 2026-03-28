import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { createGetCheckoutStateBySessionIdQueryHandler } from "@/application/queries/get-checkout-state-by-session-id-query-handler";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { createGetUpgradeCheckoutReturnStateRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const { commercialSubscriptionRepository } = getCommercialRuntime();
const getCheckoutStateBySessionIdQueryHandler = createGetCheckoutStateBySessionIdQueryHandler({
  repository: commercialSubscriptionRepository,
});

export const GET = createGetUpgradeCheckoutReturnStateRouteHandler({
  getCheckoutStateBySessionId: async ({ checkoutSessionId }) =>
    toUpgradeCheckoutReadModel(
      await getCheckoutStateBySessionIdQueryHandler({ checkoutSessionId }),
    ),
});
