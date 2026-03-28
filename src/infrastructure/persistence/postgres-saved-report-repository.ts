import type { AnalysisSnapshot } from "@/domain/analysis/types";
import type { SavedReportRepository } from "@/ports/saved-report-repository";
import { query } from "@/infrastructure/persistence/postgres-client";

type SavedReportRow = {
  report_id: string;
  label: string | null;
  saved_at: string;
  analysis_json: AnalysisSnapshot["analysis"];
};

export function createPostgresSavedReportRepository(): SavedReportRepository {
  return {
    async save(userId, report) {
      await query(
        `INSERT INTO saved_reports (report_id, user_id, label, saved_at, analysis_json)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (report_id)
         DO UPDATE SET
           label = EXCLUDED.label,
           saved_at = EXCLUDED.saved_at,
           analysis_json = EXCLUDED.analysis_json`,
        [
          report.snapshotId,
          userId,
          report.label,
          report.savedAt,
          JSON.stringify(report.analysis),
        ],
      );
    },
    async list(userId) {
      const result = await query<SavedReportRow>(
        `SELECT report_id, label, saved_at::text, analysis_json
           FROM saved_reports
          WHERE user_id = $1
          ORDER BY saved_at DESC`,
        [userId],
      );

      return result.rows.map((row) => ({
        snapshotId: row.report_id,
        label: row.label,
        savedAt: row.saved_at,
        analysis: row.analysis_json,
      }));
    },
  };
}
