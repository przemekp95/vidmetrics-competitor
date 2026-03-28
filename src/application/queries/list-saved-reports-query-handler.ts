import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { AnalysisSnapshot } from "@/domain/analysis/types";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { SavedReportRepository } from "@/ports/saved-report-repository";

export function createListSavedReportsQueryHandler({
  commercialSubscriptionRepository,
  savedReportRepository,
}: {
  commercialSubscriptionRepository: CommercialSubscriptionRepository;
  savedReportRepository: SavedReportRepository;
}) {
  return async function handleListSavedReportsQuery(input: {
    userId: string;
  }): Promise<AnalysisSnapshot[]> {
    const account =
      (await commercialSubscriptionRepository.getByUserId(input.userId)) ??
      CommercialAccount.create(input.userId);

    account.assertHasEntitlement("durable_reports");

    return savedReportRepository.list(input.userId);
  };
}
