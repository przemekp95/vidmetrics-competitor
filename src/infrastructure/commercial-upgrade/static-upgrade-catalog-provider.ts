import type { CommercialPlan } from "@/domain/commercial-upgrade/types";
import type { UpgradeCatalogProvider } from "@/ports/upgrade-catalog-provider";

export const commercialUpgradeCatalog: CommercialPlan[] = [
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

export function createStaticUpgradeCatalogProvider(): UpgradeCatalogProvider {
  return {
    async getCatalog() {
      return commercialUpgradeCatalog;
    },
  };
}
