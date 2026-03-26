import type { AnalysisFrame, AnalyzedChannel, SourceMetadata } from "@/domain/analysis/types";
import type { ChannelLookup } from "@/ports/channel-lookup-resolver";

export type SourceChannelVideo = {
  id: string;
  title: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
};

export type SourceChannelSnapshot = {
  channel: AnalyzedChannel;
  videos: SourceChannelVideo[];
  source: SourceMetadata;
};

export interface CompetitorChannelSource {
  fetchCurrentMonthVideos(input: {
    lookup: ChannelLookup;
    window: AnalysisFrame;
    maxVideos: number;
  }): Promise<SourceChannelSnapshot>;
}
