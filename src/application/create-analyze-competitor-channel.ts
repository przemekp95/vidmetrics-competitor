import { buildChannelAnalysis, createAnalysisWindow } from "@/domain/analysis/build-channel-analysis";
import type { ChannelAnalysisResponse } from "@/domain/analysis/types";
import type { ChannelLookupResolver } from "@/ports/channel-lookup-resolver";
import type { CompetitorChannelSource } from "@/ports/competitor-channel-source";

export function createAnalyzeCompetitorChannel({
  resolver,
  source,
  now = () => new Date(),
}: {
  resolver: ChannelLookupResolver;
  source: CompetitorChannelSource;
  now?: () => Date;
}) {
  return async function analyzeCompetitorChannel(input: {
    channelUrl: string;
  }): Promise<ChannelAnalysisResponse> {
    const lookup = await resolver.resolve(input.channelUrl);
    const window = createAnalysisWindow(now());
    const snapshot = await source.fetchCurrentMonthVideos({
      lookup,
      window,
      maxVideos: 100,
    });

    return buildChannelAnalysis(snapshot, window);
  };
}
