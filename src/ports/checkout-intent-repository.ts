import type { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";

export interface CheckoutIntentRepository {
  get(sessionId: string): Promise<CheckoutIntent | null>;
  save(sessionId: string, checkoutIntent: CheckoutIntent): Promise<void>;
}
