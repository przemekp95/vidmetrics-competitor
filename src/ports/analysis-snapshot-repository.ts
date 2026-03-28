import type { AnalysisSnapshot } from "@/domain/analysis/types";

export interface AnalysisSnapshotRepository {
  save(sessionId: string, snapshot: AnalysisSnapshot): Promise<void>;
  list(sessionId: string): Promise<AnalysisSnapshot[]>;
  clear(sessionId: string): Promise<void>;
}
