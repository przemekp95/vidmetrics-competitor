import type { AnalysisSnapshot } from "@/domain/analysis/types";
import type { AnalysisSnapshotRepository } from "@/ports/analysis-snapshot-repository";

const snapshotsBySession = new Map<string, Map<string, AnalysisSnapshot>>();

export function createInMemoryAnalysisSnapshotRepository(): AnalysisSnapshotRepository {
  return {
    async save(sessionId, snapshot) {
      const sessionSnapshots = snapshotsBySession.get(sessionId) ?? new Map<string, AnalysisSnapshot>();
      sessionSnapshots.set(snapshot.snapshotId, snapshot);
      snapshotsBySession.set(sessionId, sessionSnapshots);
    },
    async list(sessionId) {
      const sessionSnapshots = snapshotsBySession.get(sessionId);
      return sessionSnapshots
        ? [...sessionSnapshots.values()].sort((left, right) => right.savedAt.localeCompare(left.savedAt))
        : [];
    },
    async clear(sessionId) {
      snapshotsBySession.delete(sessionId);
    },
  };
}
