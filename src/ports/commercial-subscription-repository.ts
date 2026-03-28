import type { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";

export interface CommercialSubscriptionRepository {
  getByUserId(userId: string): Promise<CommercialAccount | null>;
  getByStripeCustomerId(stripeCustomerId: string): Promise<CommercialAccount | null>;
  getByStripeSubscriptionId(stripeSubscriptionId: string): Promise<CommercialAccount | null>;
  getByCheckoutSessionId(checkoutSessionId: string): Promise<CommercialAccount | null>;
  save(account: CommercialAccount): Promise<void>;
}
