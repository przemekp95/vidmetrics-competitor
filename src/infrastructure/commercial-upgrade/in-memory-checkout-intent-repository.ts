import type { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";
import type { CheckoutIntentRepository } from "@/ports/checkout-intent-repository";

const checkoutIntents = new Map<string, CheckoutIntent>();

export function createInMemoryCheckoutIntentRepository(): CheckoutIntentRepository {
  return {
    async get(sessionId) {
      return checkoutIntents.get(sessionId) ?? null;
    },
    async save(sessionId, checkoutIntent) {
      checkoutIntents.set(sessionId, checkoutIntent);
    },
  };
}
