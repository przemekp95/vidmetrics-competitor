import type { AnalysisSnapshot } from "@/domain/analysis/types";

export interface SavedReportRepository {
  save(userId: string, report: AnalysisSnapshot): Promise<void>;
  list(userId: string): Promise<AnalysisSnapshot[]>;
}
