import Stripe from "stripe";

import type { BillingCheckoutGateway, BillingWebhookVerifier } from "@/ports/billing-checkout-gateway";
import type { BillingCycleValue, BillingLifecycleEvent, CheckoutStatus, PlanId } from "@/domain/commercial-upgrade/types";
import { ApplicationError } from "@/shared/application-error";

type StripePriceIdConfig = Record<PlanId, Record<BillingCycleValue, string>>;

const STRIPE_API_VERSION: Stripe.LatestApiVersion = "2026-03-25.dahlia";
const DEFAULT_STRIPE_PRICE_IDS: StripePriceIdConfig = {
  team: {
    monthly: "price_1TG2wuA0RuhjBcddsSXJYpWn",
    annual: "price_1TG2wvA0RuhjBcddkRyXC5ef",
  },
  enterprise: {
    monthly: "price_1TG2wwA0RuhjBcddhIefAcTT",
    annual: "price_1TG2wyA0RuhjBcddUlzikinv",
  },
};

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new ApplicationError(
      "MISSING_STRIPE_SECRET_KEY",
      "STRIPE_SECRET_KEY is required to create Stripe checkout sessions.",
      500,
      "Billing is temporarily unavailable.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
  }

  return stripeClient;
}

function getStripeWebhookSecret() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new ApplicationError(
      "MISSING_STRIPE_WEBHOOK_SECRET",
      "STRIPE_WEBHOOK_SECRET is required to verify Stripe webhook events.",
      500,
      "Billing is temporarily unavailable.",
    );
  }

  return process.env.STRIPE_WEBHOOK_SECRET;
}

export function getStripePriceIdConfig(): StripePriceIdConfig {
  return {
    team: {
      monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID ?? DEFAULT_STRIPE_PRICE_IDS.team.monthly,
      annual: process.env.STRIPE_TEAM_ANNUAL_PRICE_ID ?? DEFAULT_STRIPE_PRICE_IDS.team.annual,
    },
    enterprise: {
      monthly:
        process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID ??
        DEFAULT_STRIPE_PRICE_IDS.enterprise.monthly,
      annual:
        process.env.STRIPE_ENTERPRISE_ANNUAL_PRICE_ID ??
        DEFAULT_STRIPE_PRICE_IDS.enterprise.annual,
    },
  };
}

export function resolveStripePriceId(
  input: {
    planId: PlanId;
    billingCycle: BillingCycleValue;
  },
  priceIds: StripePriceIdConfig = getStripePriceIdConfig(),
) {
  const priceId = priceIds[input.planId][input.billingCycle];

  if (!priceId) {
    throw new ApplicationError(
      "STRIPE_PRICE_NOT_CONFIGURED",
      `No Stripe price id is configured for ${input.planId}:${input.billingCycle}.`,
      500,
      "Billing is temporarily unavailable.",
    );
  }

  return priceId;
}

export function createStripeBillingCheckoutGateway(
  stripe?: Stripe,
): BillingCheckoutGateway {
  return {
    async createSubscriptionCheckout(input) {
      const resolvedStripe = stripe ?? getStripeClient();
      const priceId = resolveStripePriceId({
        planId: input.selection.getPlanId(),
        billingCycle: input.selection.getBillingCycle(),
      });
      const stripeCustomerId =
        input.existingStripeCustomerId ??
        (
          await resolvedStripe.customers.create({
            email: input.email,
            name: input.name ?? undefined,
            metadata: {
              clerkUserId: input.userId,
            },
          })
        ).id;

      const metadata = {
        clerkUserId: input.userId,
        planId: input.selection.getPlanId(),
        billingCycle: input.selection.getBillingCycle(),
        seats: String(input.selection.getSeats()),
      };

      const session = await resolvedStripe.checkout.sessions.create({
        mode: "subscription",
        client_reference_id: input.userId,
        customer: stripeCustomerId,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        line_items: [
          {
            price: priceId,
            quantity: input.selection.getSeats(),
          },
        ],
        metadata,
        subscription_data: {
          metadata,
        },
        custom_text: {
          submit: {
            message:
              "Sandbox Stripe subscription for B2B MVP review. Use test payment details only.",
          },
        },
      });

      if (!session.url) {
        throw new ApplicationError(
          "STRIPE_CHECKOUT_URL_MISSING",
          `Stripe did not return a hosted checkout URL for session ${session.id}.`,
          502,
          "Billing is temporarily unavailable.",
        );
      }

      return {
        checkoutSessionId: session.id,
        checkoutUrl: session.url,
        stripeCustomerId,
      };
    },
  };
}

export function createStripeWebhookVerifier(
  stripe?: Stripe,
  webhookSecret?: string,
): BillingWebhookVerifier {
  return {
    async verifyAndParse(payload, signature) {
      const resolvedStripe = stripe ?? getStripeClient();
      const resolvedWebhookSecret = webhookSecret ?? getStripeWebhookSecret();

      if (!signature) {
        throw new ApplicationError(
          "MISSING_STRIPE_SIGNATURE",
          "Stripe webhook signature header is required.",
          400,
          "Stripe webhook verification failed.",
        );
      }

      const event = resolvedStripe.webhooks.constructEvent(
        payload,
        signature,
        resolvedWebhookSecret,
      );
      const occurredAt = new Date(event.created * 1000).toISOString();

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.client_reference_id ?? session.metadata?.clerkUserId ?? null;
          const stripeCustomerId = readStripeId(session.customer);

          if (!userId || !stripeCustomerId || session.mode !== "subscription") {
            return null;
          }

          return {
            type: "checkout_session_completed",
            eventId: event.id,
            userId,
            stripeCustomerId,
            stripeSubscriptionId: readStripeId(session.subscription),
            checkoutSessionId: session.id,
            occurredAt,
          } satisfies BillingLifecycleEvent;
        }
        case "invoice.paid": {
          const invoice = event.data.object;
          const stripeCustomerId = readStripeId(invoice.customer);

          if (!stripeCustomerId) {
            return null;
          }

          return {
            type: "invoice_paid",
            eventId: event.id,
            stripeCustomerId,
            stripeSubscriptionId: readStripeId((invoice as { subscription?: unknown }).subscription),
            occurredAt,
          } satisfies BillingLifecycleEvent;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const stripeCustomerId = readStripeId(invoice.customer);

          if (!stripeCustomerId) {
            return null;
          }

          return {
            type: "invoice_payment_failed",
            eventId: event.id,
            stripeCustomerId,
            stripeSubscriptionId: readStripeId((invoice as { subscription?: unknown }).subscription),
            occurredAt,
          } satisfies BillingLifecycleEvent;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const stripeCustomerId = readStripeId(subscription.customer);
          const status = normalizeSubscriptionStatus(subscription.status);

          if (!stripeCustomerId || !status) {
            return null;
          }

          return {
            type: "subscription_updated",
            eventId: event.id,
            stripeCustomerId,
            stripeSubscriptionId: subscription.id,
            status,
            occurredAt,
          } satisfies BillingLifecycleEvent;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const stripeCustomerId = readStripeId(subscription.customer);

          if (!stripeCustomerId) {
            return null;
          }

          return {
            type: "subscription_deleted",
            eventId: event.id,
            stripeCustomerId,
            stripeSubscriptionId: subscription.id,
            occurredAt,
          } satisfies BillingLifecycleEvent;
        }
        default:
          return null;
      }
    },
  };
}

function readStripeId(
  value: unknown,
) {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && "id" in value && typeof value.id === "string") {
    return value.id;
  }

  return null;
}

function normalizeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): Extract<CheckoutStatus, "active" | "past_due" | "canceled"> | null {
  if (status === "active" || status === "trialing") {
    return "active";
  }

  if (status === "past_due" || status === "unpaid") {
    return "past_due";
  }

  if (status === "canceled" || status === "incomplete" || status === "incomplete_expired" || status === "paused") {
    return "canceled";
  }

  return null;
}
