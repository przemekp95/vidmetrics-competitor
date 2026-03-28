import { describe, expect, it, vi } from "vitest";

import {
  createGetUpgradeCheckoutRouteHandler,
  createGetUpgradeCheckoutReturnStateRouteHandler,
  createStartUpgradeCheckoutRouteHandler,
  createStripeWebhookRouteHandler,
} from "@/transport/http/upgrade-checkout-route";

const checkoutPayload = {
  status: "checkout_pending" as const,
  planId: "team" as const,
  planLabel: "Team Pulse",
  billingCycle: "monthly" as const,
  seats: 5,
  displayPrice: "$245/mo",
  includedFeatures: ["Saved reports", "Weekly tracking", "Team sharing"],
  entitlements: [],
  stripeCustomerId: "cus_123",
  stripeSubscriptionId: null,
  checkoutSessionId: "cs_test_123",
  checkoutCompletedAt: null,
  lastPaidAt: null,
};

describe("upgrade checkout route handlers", () => {
  it("requires auth for the billing state query", async () => {
    const handler = createGetUpgradeCheckoutRouteHandler({
      getCheckoutState: vi.fn(),
      getAuthenticatedUser: vi.fn().mockResolvedValue(null),
    });

    const response = await handler(new Request("http://localhost/api/upgrade-checkout"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Sign in to view billing state.",
      },
    });
  });

  it("rejects checkout start requests from untrusted origins", async () => {
    const startCheckout = vi.fn();
    const handler = createStartUpgradeCheckoutRouteHandler({
      startCheckout,
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
        },
        body: JSON.stringify({
          planId: "team",
          billingCycle: "monthly",
          seats: 5,
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it("passes valid checkout payloads plus auth context and return URLs to the start command", async () => {
    const startCheckout = vi.fn().mockResolvedValue({
      checkout: checkoutPayload,
      checkoutUrl: "https://checkout.stripe.test/session/123",
    });
    const handler = createStartUpgradeCheckoutRouteHandler({
      startCheckout,
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: JSON.stringify({
          planId: "team",
          billingCycle: "monthly",
          seats: 5,
        }),
      }),
    );

    expect(startCheckout).toHaveBeenCalledWith({
      userId: "user_123",
      email: "alex@agency.com",
      name: "Alex Rivera",
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
      successUrl: "http://localhost/checkout/return?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "http://localhost/checkout/return?canceled=1",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkout: checkoutPayload,
      checkoutUrl: "https://checkout.stripe.test/session/123",
    });
  });

  it("uses the authenticated user id for billing state queries", async () => {
    const getCheckoutState = vi.fn().mockResolvedValue(checkoutPayload);
    const handler = createGetUpgradeCheckoutRouteHandler({
      getCheckoutState,
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await handler(new Request("http://localhost/api/upgrade-checkout"));

    expect(getCheckoutState).toHaveBeenCalledWith({
      userId: "user_123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkout: checkoutPayload,
    });
  });

  it("returns checkout state for a public checkout session lookup", async () => {
    const getCheckoutState = vi.fn().mockResolvedValue(checkoutPayload);
    const handler = createGetUpgradeCheckoutReturnStateRouteHandler({
      getCheckoutStateBySessionId: getCheckoutState,
    });

    const response = await handler(
      new Request("http://localhost/api/checkout-return-state?session_id=cs_test_123"),
    );

    expect(getCheckoutState).toHaveBeenCalledWith({
      checkoutSessionId: "cs_test_123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkout: checkoutPayload,
    });
  });

  it("rejects missing checkout session ids for the public return state route", async () => {
    const handler = createGetUpgradeCheckoutReturnStateRouteHandler({
      getCheckoutStateBySessionId: vi.fn(),
    });

    const response = await handler(new Request("http://localhost/api/checkout-return-state"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "INVALID_REQUEST",
        message: "Provide a valid Stripe checkout session id.",
      },
    });
  });

  it("verifies Stripe webhook events and ignores unsupported ones", async () => {
    const applyBillingWebhook = vi.fn().mockResolvedValue({ applied: true });
    const handler = createStripeWebhookRouteHandler({
      billingWebhookVerifier: {
        verifyAndParse: vi
          .fn()
          .mockResolvedValueOnce(null)
          .mockResolvedValueOnce({
            type: "invoice_paid",
            eventId: "evt_paid",
            stripeCustomerId: "cus_123",
            stripeSubscriptionId: "sub_123",
            occurredAt: "2026-03-28T18:01:00.000Z",
          }),
      },
      applyBillingWebhook,
    });

    const ignoredResponse = await handler(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123",
        },
        body: "{}",
      }),
    );
    const appliedResponse = await handler(
      new Request("http://localhost/api/stripe/webhook", {
        method: "POST",
        headers: {
          "stripe-signature": "sig_123",
        },
        body: "{}",
      }),
    );

    expect(ignoredResponse.status).toBe(204);
    expect(appliedResponse.status).toBe(200);
    expect(applyBillingWebhook).toHaveBeenCalledWith({
      event: {
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-28T18:01:00.000Z",
      },
    });
  });
});
