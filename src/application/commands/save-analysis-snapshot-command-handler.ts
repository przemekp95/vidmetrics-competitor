import { fromChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import type {
  ChannelAnalysisReadModel,
  SaveAnalysisSnapshotResponse,
} from "@/application/read-models/analysis-read-model";
import type { AnalysisSnapshotRepository } from "@/ports/analysis-snapshot-repository";

export function createSaveAnalysisSnapshotCommandHandler({
  repository,
  now = () => new Date(),
  createSnapshotId = () => crypto.randomUUID(),
}: {
  repository: AnalysisSnapshotRepository;
  now?: () => Date;
  createSnapshotId?: () => string;
}) {
  return async function handleSaveAnalysisSnapshotCommand(input: {
    sessionId: string;
    label?: string;
    analysis: ChannelAnalysisReadModel;
  }): Promise<SaveAnalysisSnapshotResponse> {
    const normalizedLabel = input.label?.trim() ? input.label.trim() : null;
    const savedAt = now().toISOString();
    const snapshotId = createSnapshotId();

    await repository.save(input.sessionId, {
      snapshotId,
      label: normalizedLabel,
      savedAt,
      analysis: fromChannelAnalysisReadModel(input.analysis),
    });

    return {
      snapshotId,
      label: normalizedLabel,
      savedAt,
    };
  };
}
