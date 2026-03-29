import { describe, expect, it, vi } from "vitest";

import { createApplyBillingWebhookCommandHandler } from "@/application/commands/apply-billing-webhook-command-handler";
import { createStartUpgradeCheckoutCommandHandler } from "@/application/commands/start-upgrade-checkout-command-handler";
import { createGetCheckoutStateBySessionIdQueryHandler } from "@/application/queries/get-checkout-state-by-session-id-query-handler";
import { createGetCheckoutStateQueryHandler } from "@/application/queries/get-checkout-state-query-handler";
import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { CommercialPlan } from "@/domain/commercial-upgrade/types";
import { UpgradeCatalogPolicy } from "@/domain/commercial-upgrade/upgrade-catalog-policy";
import { ApplicationError } from "@/shared/application-error";

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

describe("upgrade checkout handlers", () => {
  it("creates a user-scoped checkout session draft and returns the redirect URL", async () => {
    const repository = {
      getByUserId: vi.fn().mockResolvedValue(null),
      getByStripeCustomerId: vi.fn().mockResolvedValue(null),
      getByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
      getByCheckoutSessionId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const provider = {
      getCatalog: vi.fn().mockResolvedValue(catalog),
    };
    const billingCheckoutGateway = {
      createSubscriptionCheckout: vi.fn().mockResolvedValue({
        checkoutSessionId: "cs_test_123",
        checkoutUrl: "https://checkout.stripe.test/session/123",
        stripeCustomerId: "cus_123",
      }),
    };
    const handle = createStartUpgradeCheckoutCommandHandler({
      repository,
      catalogProvider: provider,
      billingCheckoutGateway,
    });

    const result = await handle({
      userId: "user_123",
      email: "alex@agency.com",
      name: "Alex Rivera",
      planId: "team",
      billingCycle: "monthly",
      seats: 7,
      successUrl: "https://example.com/checkout/return?session_id={CHECKOUT_SESSION_ID}",
      cancelUrl: "https://example.com/checkout/return?canceled=1",
    });

    expect(provider.getCatalog).toHaveBeenCalledTimes(1);
    expect(billingCheckoutGateway.createSubscriptionCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_123",
        email: "alex@agency.com",
        selection: expect.anything(),
      }),
    );
    expect(repository.save).toHaveBeenCalledWith(expect.any(CommercialAccount));
    expect(result.checkoutUrl).toBe("https://checkout.stripe.test/session/123");
    expect(result.account.toSummary()).toMatchObject({
      status: "checkout_pending",
      planId: "team",
      seats: 7,
      stripeCustomerId: "cus_123",
      checkoutSessionId: "cs_test_123",
    });
  });

  it("applies Stripe lifecycle events idempotently and unlocks entitlements only after invoice paid", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "enterprise",
      billingCycle: "annual",
      seats: 24,
    });
    const repository = {
      getByUserId: vi.fn().mockResolvedValue(
        CommercialAccount.create("user_123").beginCheckout({
          selection,
          stripeCustomerId: "cus_123",
          checkoutSessionId: "cs_test_123",
        }),
      ),
      getByStripeCustomerId: vi.fn().mockResolvedValue(
        CommercialAccount.create("user_123").beginCheckout({
          selection,
          stripeCustomerId: "cus_123",
          checkoutSessionId: "cs_test_123",
        }),
      ),
      getByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
      getByCheckoutSessionId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const processedEventRepository = {
      hasProcessed: vi
        .fn()
        .mockResolvedValueOnce(false)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false),
      markProcessed: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createApplyBillingWebhookCommandHandler({
      repository,
      processedEventRepository,
    });

    const checkoutCompleted = await handle({
      event: {
        type: "checkout_session_completed",
        eventId: "evt_checkout",
        userId: "user_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        checkoutSessionId: "cs_test_123",
        occurredAt: "2026-03-28T18:00:00.000Z",
      },
    });
    const duplicate = await handle({
      event: {
        type: "checkout_session_completed",
        eventId: "evt_checkout",
        userId: "user_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        checkoutSessionId: "cs_test_123",
        occurredAt: "2026-03-28T18:00:00.000Z",
      },
    });
    await handle({
      event: {
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-28T18:01:00.000Z",
      },
    });

    expect(checkoutCompleted).toEqual({ applied: true });
    expect(duplicate).toEqual({ applied: false });
    expect(repository.save).toHaveBeenCalledTimes(2);
    expect(repository.save).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        toSummary: expect.any(Function),
      }),
    );
    expect(processedEventRepository.markProcessed).toHaveBeenCalledWith("evt_paid");
  });

  it("keeps the account active when checkout.session.completed is processed after invoice.paid", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
    });
    let account = CommercialAccount.create("user_123").beginCheckout({
      selection,
      stripeCustomerId: "cus_123",
      checkoutSessionId: "cs_test_123",
    });
    const repository = {
      getByUserId: vi.fn(async () => account),
      getByStripeCustomerId: vi.fn(async () => account),
      getByStripeSubscriptionId: vi.fn(async () => account),
      getByCheckoutSessionId: vi.fn().mockResolvedValue(null),
      save: vi.fn(async (nextAccount: CommercialAccount) => {
        account = nextAccount;
      }),
    };
    const processedEventRepository = {
      hasProcessed: vi.fn().mockResolvedValue(false),
      markProcessed: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createApplyBillingWebhookCommandHandler({
      repository,
      processedEventRepository,
    });

    await handle({
      event: {
        type: "invoice_paid",
        eventId: "evt_paid",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        occurredAt: "2026-03-29T06:12:20.000Z",
      },
    });
    await handle({
      event: {
        type: "checkout_session_completed",
        eventId: "evt_checkout",
        userId: "user_123",
        stripeCustomerId: "cus_123",
        stripeSubscriptionId: "sub_123",
        checkoutSessionId: "cs_test_123",
        occurredAt: "2026-03-29T06:12:21.000Z",
      },
    });

    expect(account.toSummary()).toMatchObject({
      status: "active",
      stripeSubscriptionId: "sub_123",
      checkoutCompletedAt: "2026-03-29T06:12:21.000Z",
      lastPaidAt: "2026-03-29T06:12:20.000Z",
      entitlements: [
        "durable_reports",
        "weekly_tracking",
        "multi_channel_benchmarks",
      ],
    });
    expect(repository.save).toHaveBeenCalledTimes(2);
  });

  it("rejects lifecycle events when no commercial account matches the webhook payload", async () => {
    const handle = createApplyBillingWebhookCommandHandler({
      repository: {
        getByUserId: vi.fn().mockResolvedValue(null),
        getByStripeCustomerId: vi.fn().mockResolvedValue(null),
        getByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
        getByCheckoutSessionId: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockResolvedValue(undefined),
      },
      processedEventRepository: {
        hasProcessed: vi.fn().mockResolvedValue(false),
        markProcessed: vi.fn().mockResolvedValue(undefined),
      },
    });

    await expect(
      handle({
        event: {
          type: "invoice_paid",
          eventId: "evt_paid",
          stripeCustomerId: "cus_missing",
          stripeSubscriptionId: "sub_missing",
          occurredAt: "2026-03-28T18:01:00.000Z",
        },
      }),
    ).rejects.toBeInstanceOf(ApplicationError);
  });

  it("returns only the current user's commercial account from the query handler", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 8,
    });
    const repository = {
      getByUserId: vi.fn().mockResolvedValue(
        CommercialAccount.create("user_123").beginCheckout({
          selection,
          stripeCustomerId: "cus_123",
          checkoutSessionId: "cs_test_123",
        }),
      ),
      getByStripeCustomerId: vi.fn().mockResolvedValue(null),
      getByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
      getByCheckoutSessionId: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createGetCheckoutStateQueryHandler({ repository });

    const account = await handle({ userId: "user_123" });

    expect(repository.getByUserId).toHaveBeenCalledWith("user_123");
    expect(account?.toSummary()).toMatchObject({
      planId: "team",
      seats: 8,
      status: "checkout_pending",
    });
  });

  it("returns checkout state by Stripe checkout session id for the public return flow", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "enterprise",
      billingCycle: "monthly",
      seats: 24,
    });
    const repository = {
      getByUserId: vi.fn().mockResolvedValue(null),
      getByStripeCustomerId: vi.fn().mockResolvedValue(null),
      getByStripeSubscriptionId: vi.fn().mockResolvedValue(null),
      getByCheckoutSessionId: vi.fn().mockResolvedValue(
        CommercialAccount.create("user_123").beginCheckout({
          selection,
          stripeCustomerId: "cus_123",
          checkoutSessionId: "cs_test_public_123",
        }),
      ),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createGetCheckoutStateBySessionIdQueryHandler({ repository });

    const account = await handle({ checkoutSessionId: "cs_test_public_123" });

    expect(repository.getByCheckoutSessionId).toHaveBeenCalledWith("cs_test_public_123");
    expect(account?.toSummary()).toMatchObject({
      planId: "enterprise",
      seats: 24,
      status: "checkout_pending",
      checkoutSessionId: "cs_test_public_123",
    });
  });
});
