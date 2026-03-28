import type { CheckoutIntentRepository } from "@/ports/checkout-intent-repository";

export function createGetCheckoutStateQueryHandler({
  repository,
}: {
  repository: CheckoutIntentRepository;
}) {
  return async function handleGetCheckoutStateQuery(input: { sessionId: string }) {
    return repository.get(input.sessionId);
  };
}
