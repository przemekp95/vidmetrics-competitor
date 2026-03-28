import { buildChannelAnalysis, createAnalysisFrame } from "@/domain/analysis/build-channel-analysis";
import type { ChannelAnalysis } from "@/domain/analysis/types";
import type { ChannelLookupResolver } from "@/ports/channel-lookup-resolver";
import type { CompetitorChannelSource } from "@/ports/competitor-channel-source";

export function createAnalyzeCompetitorChannelQueryHandler({
  resolver,
  source,
  now = () => new Date(),
}: {
  resolver: ChannelLookupResolver;
  source: CompetitorChannelSource;
  now?: () => Date;
}) {
  return async function handleAnalyzeCompetitorChannelQuery(input: {
    channelUrl: string;
  }): Promise<ChannelAnalysis> {
    const lookup = await resolver.resolve(input.channelUrl);
    const frame = createAnalysisFrame(now());
    const snapshot = await source.fetchCurrentMonthVideos({
      lookup,
      window: frame,
      maxVideos: 100,
    });

    return buildChannelAnalysis(snapshot, frame);
  };
}
