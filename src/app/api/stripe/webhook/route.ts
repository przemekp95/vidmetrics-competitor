import { createApplyBillingWebhookCommandHandler } from "@/application/commands/apply-billing-webhook-command-handler";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { createStripeWebhookRouteHandler } from "@/transport/http/upgrade-checkout-route";

export const runtime = "nodejs";

const {
  commercialSubscriptionRepository,
  processedWebhookEventRepository,
  billingWebhookVerifier,
} = getCommercialRuntime();

const applyBillingWebhook = createApplyBillingWebhookCommandHandler({
  repository: commercialSubscriptionRepository,
  processedEventRepository: processedWebhookEventRepository,
});

export const POST = createStripeWebhookRouteHandler({
  billingWebhookVerifier,
  applyBillingWebhook,
});
