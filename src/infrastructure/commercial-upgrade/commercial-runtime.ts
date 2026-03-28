import { createPostgresCommercialSubscriptionRepository } from "@/infrastructure/commercial-upgrade/postgres-commercial-subscription-repository";
import {
  createStripeBillingCheckoutGateway,
  createStripeWebhookVerifier,
} from "@/infrastructure/commercial-upgrade/stripe-billing-gateway";
import { createStaticUpgradeCatalogProvider } from "@/infrastructure/commercial-upgrade/static-upgrade-catalog-provider";
import { createPostgresProcessedWebhookEventRepository } from "@/infrastructure/persistence/postgres-processed-webhook-event-repository";
import { createPostgresSavedReportRepository } from "@/infrastructure/persistence/postgres-saved-report-repository";
import { createPostgresTrackedChannelRepository } from "@/infrastructure/persistence/postgres-tracked-channel-repository";

const catalogProvider = createStaticUpgradeCatalogProvider();
const commercialSubscriptionRepository = createPostgresCommercialSubscriptionRepository({
  catalogProvider,
});
const processedWebhookEventRepository = createPostgresProcessedWebhookEventRepository();
const savedReportRepository = createPostgresSavedReportRepository();
const trackedChannelRepository = createPostgresTrackedChannelRepository();
const billingCheckoutGateway = createStripeBillingCheckoutGateway();
const billingWebhookVerifier = createStripeWebhookVerifier();

export function getCommercialRuntime() {
  return {
    catalogProvider,
    commercialSubscriptionRepository,
    processedWebhookEventRepository,
    savedReportRepository,
    trackedChannelRepository,
    billingCheckoutGateway,
    billingWebhookVerifier,
  };
}
