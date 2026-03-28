import { toAnalysisSnapshotReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createClearAnalysisSnapshotsCommandHandler } from "@/application/commands/clear-analysis-snapshots-command-handler";
import { createSaveAnalysisSnapshotCommandHandler } from "@/application/commands/save-analysis-snapshot-command-handler";
import { createListAnalysisSnapshotsQueryHandler } from "@/application/queries/list-analysis-snapshots-query-handler";
import { createInMemoryAnalysisSnapshotRepository } from "@/infrastructure/persistence/in-memory-analysis-snapshot-repository";
import { createAnalysisSnapshotsRouteHandlers } from "@/transport/http/analysis-snapshots-route";

export const runtime = "nodejs";

const repository = createInMemoryAnalysisSnapshotRepository();
const clearAnalysisSnapshots = createClearAnalysisSnapshotsCommandHandler({ repository });
const saveAnalysisSnapshot = createSaveAnalysisSnapshotCommandHandler({ repository });
const listAnalysisSnapshotsQueryHandler = createListAnalysisSnapshotsQueryHandler({ repository });
const handlers = createAnalysisSnapshotsRouteHandlers({
  saveAnalysisSnapshot,
  listAnalysisSnapshots: async ({ sessionId }) =>
    (await listAnalysisSnapshotsQueryHandler({ sessionId })).map((snapshot) => toAnalysisSnapshotReadModel(snapshot)),
  clearAnalysisSnapshots,
});

export const GET = handlers.GET;
export const POST = handlers.POST;
export const DELETE = handlers.DELETE;
