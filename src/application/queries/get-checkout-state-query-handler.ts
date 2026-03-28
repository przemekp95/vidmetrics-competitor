import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";

export function createGetCheckoutStateQueryHandler({
  repository,
}: {
  repository: CommercialSubscriptionRepository;
}) {
  return async function handleGetCheckoutStateQuery(input: { userId: string }) {
    return repository.getByUserId(input.userId);
  };
}
