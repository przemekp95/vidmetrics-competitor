import { createGetCheckoutStateQueryHandler } from "@/application/queries/get-checkout-state-query-handler";
import { toUpgradeCheckoutReadModel } from "@/application/mappers/map-upgrade-checkout-to-read-model";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createGetUpgradeCheckoutRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const { commercialSubscriptionRepository } = getCommercialRuntime();
const getCheckoutStateQueryHandler = createGetCheckoutStateQueryHandler({
  repository: commercialSubscriptionRepository,
});

export const GET = createGetUpgradeCheckoutRouteHandler({
  getCheckoutState: async ({ userId }) =>
    toUpgradeCheckoutReadModel(await getCheckoutStateQueryHandler({ userId })),
  getAuthenticatedUser: async () => getAuthenticatedUser(),
});
