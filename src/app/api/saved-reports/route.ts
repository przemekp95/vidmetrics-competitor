import { createSaveSavedReportCommandHandler } from "@/application/commands/save-saved-report-command-handler";
import { toAnalysisSnapshotReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createListSavedReportsQueryHandler } from "@/application/queries/list-saved-reports-query-handler";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createSavedReportsRouteHandlers } from "@/transport/http/paid-workflows-route";

export const runtime = "nodejs";

const { commercialSubscriptionRepository, savedReportRepository } = getCommercialRuntime();
const listSavedReportsQueryHandler = createListSavedReportsQueryHandler({
  commercialSubscriptionRepository,
  savedReportRepository,
});
const saveSavedReportCommandHandler = createSaveSavedReportCommandHandler({
  commercialSubscriptionRepository,
  savedReportRepository,
});
const handlers = createSavedReportsRouteHandlers({
  listSavedReports: async ({ userId }) =>
    (await listSavedReportsQueryHandler({ userId })).map((report) =>
      toAnalysisSnapshotReadModel(report),
    ),
  saveSavedReport: async (input) => saveSavedReportCommandHandler(input),
  getAuthenticatedUser: async () => getAuthenticatedUser(),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
