import { describe, expect, it, vi } from "vitest";

import {
  createStripeBillingCheckoutGateway,
  createStripeWebhookVerifier,
  resolveStripePriceId,
} from "@/infrastructure/commercial-upgrade/stripe-billing-gateway";

describe("resolveStripePriceId", () => {
  const priceIds = {
    team: {
      monthly: "price_team_monthly",
      annual: "price_team_annual",
    },
    enterprise: {
      monthly: "price_enterprise_monthly",
      annual: "price_enterprise_annual",
    },
  };

  it("maps plan and billing cycle to the configured Stripe price id", () => {
    expect(
      resolveStripePriceId(
        {
          planId: "team",
          billingCycle: "monthly",
        },
        priceIds,
      ),
    ).toBe("price_team_monthly");

    expect(
      resolveStripePriceId(
        {
          planId: "enterprise",
          billingCycle: "annual",
        },
        priceIds,
      ),
    ).toBe("price_enterprise_annual");
  });

  it("throws when the target plan price is not configured", () => {
    expect(() =>
      resolveStripePriceId(
        {
          planId: "team",
          billingCycle: "monthly",
        },
        {
          ...priceIds,
          team: {
            ...priceIds.team,
            monthly: "",
          },
        },
      ),
    ).toThrowError("No Stripe price id is configured for team:monthly.");
  });

  it("creates Stripe adapters lazily so missing env does not crash module initialization", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", undefined);
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", undefined);

    expect(() => createStripeBillingCheckoutGateway()).not.toThrow();
    expect(() => createStripeWebhookVerifier()).not.toThrow();

    vi.unstubAllEnvs();
  });
});
