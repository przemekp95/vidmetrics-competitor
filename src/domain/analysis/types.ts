export type TrendLabel = "hot" | "above_avg" | "steady";

export type AnalysisWindow = {
  label: string;
  monthKey: string;
  startAt: string;
  endAt: string;
};

export type AnalysisFrame = AnalysisWindow & {
  generatedAt: string;
};

export type AnalyzedChannel = {
  id: string;
  title: string;
  avatarUrl: string;
  subscriberCount: number;
  channelUrl: string;
};

export type CompetitorVideo = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationText: string;
  views: number;
  likes: number;
  comments: number;
  viewsPerDay: number;
  engagementRate: number;
  trend: TrendLabel;
};

export type ChannelSummary = {
  uploadCount: number;
  averageViewsPerDay: number;
  averageEngagementRate: number;
  topPerformer: {
    title: string;
    viewsPerDay: number;
    videoUrl: string;
  } | null;
};

export type SourceMetadata = {
  provider: "youtube-data-api-v3";
  cache: "memory-ttl" | "none";
};

export type ChannelAnalysisResponse = {
  channel: AnalyzedChannel;
  window: AnalysisWindow;
  summary: ChannelSummary;
  videos: CompetitorVideo[];
  source: SourceMetadata;
};
