import { describe, expect, it, vi } from "vitest";

import { createConfirmUpgradeCheckoutCommandHandler } from "@/application/commands/confirm-upgrade-checkout-command-handler";
import { createStartUpgradeCheckoutCommandHandler } from "@/application/commands/start-upgrade-checkout-command-handler";
import { createGetCheckoutStateQueryHandler } from "@/application/queries/get-checkout-state-query-handler";
import { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";
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
    includedFeatures: [
      "Saved reports",
      "Weekly tracking",
      "Team sharing",
    ],
  },
  {
    planId: "enterprise",
    label: "Enterprise Benchmarking",
    minSeats: 20,
    maxSeats: 250,
    monthlyPricePerSeat: 99,
    annualPricePerSeat: 79,
    includedFeatures: [
      "Multi-channel benchmarks",
      "Procurement support",
      "Quarterly strategy reviews",
    ],
  },
];

describe("upgrade checkout handlers", () => {
  it("creates a session-scoped draft checkout", async () => {
    const repository = {
      get: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const provider = {
      getCatalog: vi.fn().mockResolvedValue(catalog),
    };
    const handle = createStartUpgradeCheckoutCommandHandler({
      repository,
      catalogProvider: provider,
    });

    const checkout = await handle({
      sessionId: "session-a",
      planId: "team",
      billingCycle: "monthly",
      seats: 7,
    });

    expect(provider.getCatalog).toHaveBeenCalledTimes(1);
    expect(repository.save).toHaveBeenCalledWith(
      "session-a",
      expect.any(CheckoutIntent),
    );
    expect(checkout.toSummary()).toMatchObject({
      status: "draft",
      planId: "team",
      seats: 7,
    });
  });

  it("confirms an existing session checkout and returns submitted state", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "enterprise",
      billingCycle: "annual",
      seats: 24,
    });
    const repository = {
      get: vi.fn().mockResolvedValue(CheckoutIntent.start(selection)),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createConfirmUpgradeCheckoutCommandHandler({
      repository,
      now: () => new Date("2026-03-28T18:00:00.000Z"),
      createConfirmationCode: () => "VM-20260328-0001",
    });

    const checkout = await handle({
      sessionId: "session-a",
      buyerName: "Alex Rivera",
      buyerEmail: "alex@agency.com",
      companyName: "Northwind Media",
    });

    expect(repository.get).toHaveBeenCalledWith("session-a");
    expect(repository.save).toHaveBeenCalledWith(
      "session-a",
      expect.any(CheckoutIntent),
    );
    expect(checkout.toSummary()).toMatchObject({
      status: "submitted",
      confirmationCode: "VM-20260328-0001",
      companyName: "Northwind Media",
    });
  });

  it("rejects checkout confirmation when there is no draft for the session", async () => {
    const handle = createConfirmUpgradeCheckoutCommandHandler({
      repository: {
        get: vi.fn().mockResolvedValue(null),
        save: vi.fn().mockResolvedValue(undefined),
      },
    });

    try {
      await handle({
        sessionId: "missing-session",
        buyerName: "Alex Rivera",
        buyerEmail: "alex@agency.com",
        companyName: "Northwind Media",
      });
      throw new Error("expected confirmation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError).code).toBe("CHECKOUT_NOT_FOUND");
    }
  });

  it("returns only the current session checkout from the query handler", async () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 8,
    });
    const repository = {
      get: vi.fn().mockResolvedValue(CheckoutIntent.start(selection)),
      save: vi.fn().mockResolvedValue(undefined),
    };
    const handle = createGetCheckoutStateQueryHandler({ repository });

    const checkout = await handle({ sessionId: "session-b" });

    expect(repository.get).toHaveBeenCalledWith("session-b");
    expect(checkout?.toSummary()).toMatchObject({
      planId: "team",
      seats: 8,
    });
  });
});
