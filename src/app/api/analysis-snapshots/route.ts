import { toAnalysisSnapshotReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createClearAnalysisSnapshotsCommandHandler } from "@/application/commands/clear-analysis-snapshots-command-handler";
import { createSaveAnalysisSnapshotCommandHandler } from "@/application/commands/save-analysis-snapshot-command-handler";
import { createListAnalysisSnapshotsQueryHandler } from "@/application/queries/list-analysis-snapshots-query-handler";
import { createInMemoryAnalysisSnapshotRepository } from "@/infrastructure/persistence/in-memory-analysis-snapshot-repository";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
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

function createErrorResponse(status: number, code: string, message: string) {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  return origin === new URL(request.url).origin;
}

export const GET = async (request: Request) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return createErrorResponse(401, "UNAUTHORIZED", "Sign in to view session snapshots.");
  }

  return handlers.GET(request);
};

export const POST = async (request: Request) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return createErrorResponse(401, "UNAUTHORIZED", "Sign in before saving a snapshot.");
  }

  if (!hasTrustedOrigin(request)) {
    return createErrorResponse(403, "UNTRUSTED_ORIGIN", "Send this request from the signed-in workspace.");
  }

  return handlers.POST(request);
};

export const DELETE = async (request: Request) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return createErrorResponse(401, "UNAUTHORIZED", "Sign in before clearing snapshots.");
  }

  if (!hasTrustedOrigin(request)) {
    return createErrorResponse(403, "UNTRUSTED_ORIGIN", "Send this request from the signed-in workspace.");
  }

  return handlers.DELETE(request);
};
