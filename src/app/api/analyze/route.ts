import { toChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createAnalyzeCompetitorChannelQueryHandler } from "@/application/queries/analyze-competitor-channel-query-handler";
import { createInMemoryAnalyzeRequestGuard } from "@/infrastructure/runtime/in-memory-analyze-request-guard";
import { createChannelLookupResolver } from "@/infrastructure/youtube/channel-url-resolver";
import { createYouTubeDataApiSource } from "@/infrastructure/youtube/youtube-data-api-source";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createAnalyzeRouteHandler } from "@/transport/http/analyze-route";

export const runtime = "nodejs";

const analyzeCompetitorChannelQueryHandler = createAnalyzeCompetitorChannelQueryHandler({
  resolver: createChannelLookupResolver(),
  source: createYouTubeDataApiSource(),
});
const requestGuard = createInMemoryAnalyzeRequestGuard();
const handleAnalyze = createAnalyzeRouteHandler({
  analyzeCompetitorChannel: async (input) =>
    toChannelAnalysisReadModel(await analyzeCompetitorChannelQueryHandler(input)),
  requestGuard,
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
export const POST = async (request: Request) => {
  const user = await getAuthenticatedUser();

  if (!user) {
    return createErrorResponse(401, "UNAUTHORIZED", "Sign in before running an analysis.");
  }

  if (!hasTrustedOrigin(request)) {
    return createErrorResponse(403, "UNTRUSTED_ORIGIN", "Send this request from the signed-in workspace.");
  }

  return handleAnalyze(request);
};
