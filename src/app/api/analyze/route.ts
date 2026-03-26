import { createAnalyzeCompetitorChannel } from "@/application/create-analyze-competitor-channel";
import { createChannelLookupResolver } from "@/infrastructure/youtube/channel-url-resolver";
import { createYouTubeDataApiSource } from "@/infrastructure/youtube/youtube-data-api-source";
import { createAnalyzeRouteHandler } from "@/transport/http/analyze-route";

export const runtime = "nodejs";

const analyzeCompetitorChannel = createAnalyzeCompetitorChannel({
  resolver: createChannelLookupResolver(),
  source: createYouTubeDataApiSource(),
});

export const POST = createAnalyzeRouteHandler({
  analyzeCompetitorChannel,
});
