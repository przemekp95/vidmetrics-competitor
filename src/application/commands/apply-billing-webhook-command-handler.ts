import type { BillingLifecycleEvent } from "@/domain/commercial-upgrade/types";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { ProcessedWebhookEventRepository } from "@/ports/processed-webhook-event-repository";
import { ApplicationError } from "@/shared/application-error";

export function createApplyBillingWebhookCommandHandler({
  repository,
  processedEventRepository,
}: {
  repository: CommercialSubscriptionRepository;
  processedEventRepository: ProcessedWebhookEventRepository;
}) {
  return async function handleApplyBillingWebhookCommand(input: {
    event: BillingLifecycleEvent;
  }) {
    if (await processedEventRepository.hasProcessed(input.event.eventId)) {
      return { applied: false };
    }

    const account = await resolveAccount(repository, input.event);

    if (!account) {
      throw new ApplicationError(
        "COMMERCIAL_ACCOUNT_NOT_FOUND",
        `No commercial account matched event ${input.event.eventId}.`,
        404,
        "The billing event could not be matched to an account.",
      );
    }

    await repository.save(account.applyBillingEvent(input.event));
    await processedEventRepository.markProcessed(input.event.eventId);

    return { applied: true };
  };
}

async function resolveAccount(
  repository: CommercialSubscriptionRepository,
  event: BillingLifecycleEvent,
) {
  if (event.type === "checkout_session_completed") {
    return repository.getByUserId(event.userId);
  }

  if (event.stripeSubscriptionId) {
    const bySubscription = await repository.getByStripeSubscriptionId(event.stripeSubscriptionId);

    if (bySubscription) {
      return bySubscription;
    }
  }

  if (event.stripeCustomerId) {
    const byCustomer = await repository.getByStripeCustomerId(event.stripeCustomerId);

    if (byCustomer) {
      return byCustomer;
    }
  }

  return null;
}
