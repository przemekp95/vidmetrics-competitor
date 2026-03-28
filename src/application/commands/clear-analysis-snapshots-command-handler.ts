import type { AnalysisSnapshotRepository } from "@/ports/analysis-snapshot-repository";

export function createClearAnalysisSnapshotsCommandHandler({
  repository,
}: {
  repository: AnalysisSnapshotRepository;
}) {
  return async function handleClearAnalysisSnapshotsCommand(input: { sessionId: string }) {
    await repository.clear(input.sessionId);
  };
}
