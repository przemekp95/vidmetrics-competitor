import { describe, expect, it } from "vitest";

import { ApplicationError } from "@/shared/application-error";
import { BuyerProfile } from "@/domain/commercial-upgrade/buyer-profile";
import { CheckoutIntent } from "@/domain/commercial-upgrade/checkout-intent";
import { CompanyProfile } from "@/domain/commercial-upgrade/company-profile";
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

describe("CheckoutIntent", () => {
  it("creates a draft checkout summary from a valid plan selection", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
    });

    const checkout = CheckoutIntent.start(selection);

    expect(checkout.toSummary()).toEqual({
      status: "draft",
      planId: "team",
      planLabel: "Team Pulse",
      billingCycle: "monthly",
      seats: 5,
      displayPrice: "$245/mo",
      includedFeatures: [
        "Saved reports",
        "Weekly tracking",
        "Team sharing",
      ],
      buyerName: null,
      buyerEmail: null,
      companyName: null,
      submittedAt: null,
      confirmationCode: null,
    });
  });

  it("rejects seat counts outside the supported plan range", () => {
    try {
      new UpgradeCatalogPolicy(catalog).createSelection({
        planId: "team",
        billingCycle: "monthly",
        seats: 2,
      });
      throw new Error("expected selection creation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApplicationError);
      expect((error as ApplicationError).code).toBe("INVALID_SEAT_COUNT");
    }
  });

  it("validates buyer and company profiles", () => {
    expect(() =>
      BuyerProfile.create({
        name: "",
        email: "not-an-email",
      }),
    ).toThrowError("Enter the buyer name before submitting checkout.");

    expect(() =>
      CompanyProfile.create({
        name: "",
      }),
    ).toThrowError("Enter the company name before submitting checkout.");
  });

  it("submits a draft checkout and returns confirmation summary", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "enterprise",
      billingCycle: "annual",
      seats: 24,
    });
    const checkout = CheckoutIntent.start(selection);

    const submitted = checkout.confirm({
      buyerProfile: BuyerProfile.create({
        name: "Alex Rivera",
        email: "alex@agency.com",
      }),
      companyProfile: CompanyProfile.create({
        name: "Northwind Media",
      }),
      submittedAt: "2026-03-28T18:00:00.000Z",
      confirmationCode: "VM-20260328-0001",
    });

    expect(submitted.toSummary()).toMatchObject({
      status: "submitted",
      planId: "enterprise",
      billingCycle: "annual",
      seats: 24,
      displayPrice: "$22,752/yr",
      buyerName: "Alex Rivera",
      buyerEmail: "alex@agency.com",
      companyName: "Northwind Media",
      submittedAt: "2026-03-28T18:00:00.000Z",
      confirmationCode: "VM-20260328-0001",
    });
  });

  it("does not allow a submitted checkout to be confirmed twice", () => {
    const selection = new UpgradeCatalogPolicy(catalog).createSelection({
      planId: "team",
      billingCycle: "monthly",
      seats: 6,
    });

    const submitted = CheckoutIntent.start(selection).confirm({
      buyerProfile: BuyerProfile.create({
        name: "Alex Rivera",
        email: "alex@agency.com",
      }),
      companyProfile: CompanyProfile.create({
        name: "Northwind Media",
      }),
      submittedAt: "2026-03-28T18:00:00.000Z",
      confirmationCode: "VM-20260328-0001",
    });

    expect(() =>
      submitted.confirm({
        buyerProfile: BuyerProfile.create({
          name: "Alex Rivera",
          email: "alex@agency.com",
        }),
        companyProfile: CompanyProfile.create({
          name: "Northwind Media",
        }),
        submittedAt: "2026-03-28T18:05:00.000Z",
        confirmationCode: "VM-20260328-0002",
      }),
    ).toThrowError("This checkout has already been submitted.");
  });
});
