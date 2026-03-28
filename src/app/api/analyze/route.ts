import { toChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createAnalyzeCompetitorChannelQueryHandler } from "@/application/queries/analyze-competitor-channel-query-handler";
import { createInMemoryAnalyzeRequestGuard } from "@/infrastructure/runtime/in-memory-analyze-request-guard";
import { createChannelLookupResolver } from "@/infrastructure/youtube/channel-url-resolver";
import { createYouTubeDataApiSource } from "@/infrastructure/youtube/youtube-data-api-source";
import { createAnalyzeRouteHandler } from "@/transport/http/analyze-route";

export const runtime = "nodejs";

const analyzeCompetitorChannelQueryHandler = createAnalyzeCompetitorChannelQueryHandler({
  resolver: createChannelLookupResolver(),
  source: createYouTubeDataApiSource(),
});
const requestGuard = createInMemoryAnalyzeRequestGuard();

export const POST = createAnalyzeRouteHandler({
  analyzeCompetitorChannel: async (input) =>
    toChannelAnalysisReadModel(await analyzeCompetitorChannelQueryHandler(input)),
  requestGuard,
});
