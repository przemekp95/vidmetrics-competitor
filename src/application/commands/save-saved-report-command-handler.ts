import { fromChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import type {
  ChannelAnalysisReadModel,
  SaveAnalysisSnapshotResponse,
} from "@/application/read-models/analysis-read-model";
import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { SavedReportRepository } from "@/ports/saved-report-repository";

export function createSaveSavedReportCommandHandler({
  commercialSubscriptionRepository,
  savedReportRepository,
  now = () => new Date(),
  createReportId = () => crypto.randomUUID(),
}: {
  commercialSubscriptionRepository: CommercialSubscriptionRepository;
  savedReportRepository: SavedReportRepository;
  now?: () => Date;
  createReportId?: () => string;
}) {
  return async function handleSaveSavedReportCommand(input: {
    userId: string;
    label?: string;
    analysis: ChannelAnalysisReadModel;
  }): Promise<SaveAnalysisSnapshotResponse> {
    const account =
      (await commercialSubscriptionRepository.getByUserId(input.userId)) ??
      CommercialAccount.create(input.userId);

    account.assertHasEntitlement("durable_reports");

    const normalizedLabel = input.label?.trim() ? input.label.trim() : null;
    const savedAt = now().toISOString();
    const reportId = createReportId();

    await savedReportRepository.save(input.userId, {
      snapshotId: reportId,
      label: normalizedLabel,
      savedAt,
      analysis: fromChannelAnalysisReadModel(input.analysis),
    });

    return {
      snapshotId: reportId,
      label: normalizedLabel,
      savedAt,
    };
  };
}
