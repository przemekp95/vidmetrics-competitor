import type { CommercialPlan } from "@/domain/commercial-upgrade/types";

export interface UpgradeCatalogProvider {
  getCatalog(): Promise<CommercialPlan[]>;
}
