import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";

export function createGetCheckoutStateBySessionIdQueryHandler({
  repository,
}: {
  repository: CommercialSubscriptionRepository;
}) {
  return async function handleGetCheckoutStateBySessionIdQuery(input: {
    checkoutSessionId: string;
  }) {
    return repository.getByCheckoutSessionId(input.checkoutSessionId);
  };
}
