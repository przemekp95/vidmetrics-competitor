import type { AnalysisSnapshot } from "@/domain/analysis/types";
import type { AnalysisSnapshotRepository } from "@/ports/analysis-snapshot-repository";

export function createListAnalysisSnapshotsQueryHandler({
  repository,
}: {
  repository: AnalysisSnapshotRepository;
}) {
  return async function handleListAnalysisSnapshotsQuery(input: {
    sessionId: string;
  }): Promise<AnalysisSnapshot[]> {
    return repository.list(input.sessionId);
  };
}
