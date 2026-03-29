import { describe, expect, it } from "vitest";

import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import { FeatureAccessPolicy } from "@/domain/commercial-upgrade/feature-access-policy";
import type { CommercialPlan } from "@/domain/commercial-upgrade/types";
import { UpgradeCatalogPolicy } from "@/domain/commercial-upgrade/upgrade-catalog-policy";

const catalog: CommercialPlan[] = [
  {
    planId: "team",
    label: "Team Pulse",
    minSeats: 5,
    maxSeats: 50,
    monthlyPricePerSeat: 49,
    annualPricePerSeat: 39,
    includedFeatures: ["Saved reports", "Weekly tracking", "Team sharing"],
  },
  {
    planId: "enterprise",
    label: "Enterprise Benchmarking",
    minSeats: 20,
    maxSeats: 250,
    monthlyPricePerSeat: 99,
    annualPricePerSeat: 79,
    includedFeatures: ["Multi-channel benchmarks", "Procurement support", "Quarterly strategy reviews"],
  },
];

describe("CommercialAccount", () => {
  it("keeps paid entitlements locked until the subscription is active", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
    });

    const checkoutPending = CommercialAccount.create("user_123").beginCheckout({
      selection,
      stripeCustomerId: "cus_123",
      checkoutSessionId: "cs_test_123",
    });

    expect(checkoutPending.toSummary()).toMatchObject({
      status: "checkout_pending",
      entitlements: [],
      checkoutSessionId: "cs_test_123",
    });
    expect(
      FeatureAccessPolicy.hasEntitlement(checkoutPending.getStatus(), "durable_reports"),
    ).toBe(false);
  });

  it("activates paid entitlements after an invoice.paid-style event", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "enterprise",
      billingCycle: "annual",
      seats: 24,
    });

    const active = CommercialAccount.create("user_123")
      .beginCheckout({
        selection,
        stripeCustomerId: "cus_123",
        checkoutSessionId: "cs_test_123",
      })
      .applyBillingEvent({
        type: "checkout_session_completed",
        eventId: "evt_checkout",
        userId: "user_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        checkoutSessionId: "cs_test_123",
        occurredAt: "2026-03-28T18:00:00.000Z",
      })
      .applyBillingEvent({
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-28T18:01:00.000Z",
      });

    expect(active.toSummary()).toMatchObject({
      status: "active",
      planId: "enterprise",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      lastPaidAt: "2026-03-28T18:01:00.000Z",
      entitlements: [
        "durable_reports",
        "weekly_tracking",
        "multi_channel_benchmarks",
      ],
    });
  });

  it("does not downgrade an active account when checkout.session.completed arrives after invoice.paid", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
    });

    const account = CommercialAccount.create("user_123")
      .beginCheckout({
        selection,
        stripeCustomerId: "cus_123",
        checkoutSessionId: "cs_test_123",
      })
      .applyBillingEvent({
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-29T06:12:20.000Z",
      })
      .applyBillingEvent({
        type: "checkout_session_completed",
        eventId: "evt_checkout",
        userId: "user_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        checkoutSessionId: "cs_test_123",
        occurredAt: "2026-03-29T06:12:21.000Z",
      });

    expect(account.toSummary()).toMatchObject({
      status: "active",
      stripeCustomerId: "cus_123",
      stripeSubscriptionId: "sub_123",
      checkoutSessionId: "cs_test_123",
      checkoutCompletedAt: "2026-03-29T06:12:21.000Z",
      lastPaidAt: "2026-03-29T06:12:20.000Z",
      entitlements: [
        "durable_reports",
        "weekly_tracking",
        "multi_channel_benchmarks",
      ],
    });
  });

  it("moves an active subscription to past_due and canceled on later billing events", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 8,
    });

    const account = CommercialAccount.create("user_123")
      .beginCheckout({
        selection,
        stripeCustomerId: "cus_123",
        checkoutSessionId: "cs_test_123",
      })
      .applyBillingEvent({
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-28T18:01:00.000Z",
      })
      .applyBillingEvent({
        type: "invoice_payment_failed",
        eventId: "evt_failed",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-04-28T18:01:00.000Z",
      })
      .applyBillingEvent({
        type: "subscription_deleted",
        eventId: "evt_deleted",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-04-30T18:01:00.000Z",
      });

    expect(account.toSummary()).toMatchObject({
      status: "canceled",
      entitlements: [],
    });
  });
});
