import { ApplicationError } from "@/shared/application-error";
import { FeatureAccessPolicy } from "@/domain/commercial-upgrade/feature-access-policy";
import type {
  BillingLifecycleEvent,
  CommercialAccountSummary,
  CheckoutStatus,
} from "@/domain/commercial-upgrade/types";
import type { PlanSelection } from "@/domain/commercial-upgrade/plan-selection";

type StripeState = {
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  checkoutSessionId: string | null;
  checkoutCompletedAt: string | null;
  lastPaidAt: string | null;
};

export class CommercialAccount {
  private constructor(
    private readonly userId: string,
    private readonly status: CheckoutStatus,
    private readonly selection: PlanSelection | null,
    private readonly stripeState: StripeState,
  ) {}

  static create(userId: string) {
    return new CommercialAccount(userId, "draft", null, {
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      checkoutSessionId: null,
      checkoutCompletedAt: null,
      lastPaidAt: null,
    });
  }

  static rehydrate(input: {
    userId: string;
    status: CheckoutStatus;
    selection: PlanSelection | null;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    checkoutSessionId?: string | null;
    checkoutCompletedAt?: string | null;
    lastPaidAt?: string | null;
  }) {
    return new CommercialAccount(input.userId, input.status, input.selection, {
      stripeCustomerId: input.stripeCustomerId ?? null,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      checkoutSessionId: input.checkoutSessionId ?? null,
      checkoutCompletedAt: input.checkoutCompletedAt ?? null,
      lastPaidAt: input.lastPaidAt ?? null,
    });
  }

  getUserId() {
    return this.userId;
  }

  getStatus() {
    return this.status;
  }

  getStripeCustomerId() {
    return this.stripeState.stripeCustomerId;
  }

  getStripeSubscriptionId() {
    return this.stripeState.stripeSubscriptionId;
  }

  beginCheckout(input: {
    selection: PlanSelection;
    stripeCustomerId: string;
    checkoutSessionId: string;
  }) {
    return new CommercialAccount(this.userId, "checkout_pending", input.selection, {
      ...this.stripeState,
      stripeCustomerId: input.stripeCustomerId,
      checkoutSessionId: input.checkoutSessionId,
    });
  }

  applyBillingEvent(event: BillingLifecycleEvent) {
    switch (event.type) {
      case "checkout_session_completed":
        return new CommercialAccount(this.userId, "pending_payment", this.selection, {
          ...this.stripeState,
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId,
          checkoutSessionId: event.checkoutSessionId,
          checkoutCompletedAt: event.occurredAt,
        });
      case "invoice_paid":
        return new CommercialAccount(this.userId, "active", this.selection, {
          ...this.stripeState,
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId ?? this.stripeState.stripeSubscriptionId,
          lastPaidAt: event.occurredAt,
        });
      case "invoice_payment_failed":
        return new CommercialAccount(this.userId, "past_due", this.selection, {
          ...this.stripeState,
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId ?? this.stripeState.stripeSubscriptionId,
        });
      case "subscription_updated":
        return new CommercialAccount(this.userId, event.status, this.selection, {
          ...this.stripeState,
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId,
        });
      case "subscription_deleted":
        return new CommercialAccount(this.userId, "canceled", this.selection, {
          ...this.stripeState,
          stripeCustomerId: event.stripeCustomerId,
          stripeSubscriptionId: event.stripeSubscriptionId,
        });
      default:
        return this;
    }
  }

  assertHasEntitlement(entitlement: Parameters<typeof FeatureAccessPolicy.hasEntitlement>[1]) {
    if (!FeatureAccessPolicy.hasEntitlement(this.status, entitlement)) {
      throw new ApplicationError(
        "FEATURE_LOCKED",
        `Entitlement ${entitlement} is not available for status ${this.status}.`,
        403,
        "Complete an active paid checkout before using this feature.",
      );
    }
  }

  toSummary(): CommercialAccountSummary {
    return {
      status: this.status,
      planId: this.selection?.getPlanId() ?? null,
      planLabel: this.selection?.getPlanLabel() ?? null,
      billingCycle: this.selection?.getBillingCycle() ?? null,
      seats: this.selection?.getSeats() ?? null,
      displayPrice: this.selection?.getDisplayPrice() ?? null,
      includedFeatures: this.selection?.getIncludedFeatures() ?? [],
      entitlements: FeatureAccessPolicy.getEntitlements(this.status),
      stripeCustomerId: this.stripeState.stripeCustomerId,
      stripeSubscriptionId: this.stripeState.stripeSubscriptionId,
      checkoutSessionId: this.stripeState.checkoutSessionId,
      checkoutCompletedAt: this.stripeState.checkoutCompletedAt,
      lastPaidAt: this.stripeState.lastPaidAt,
    };
  }
}
