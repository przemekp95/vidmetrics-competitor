export type Trend = "hot" | "above_avg" | "steady";

export type AnalysisWindow = {
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

export type VideoPerformance = {
  id: string;
  title: string;
  thumbnailUrl: string;
  publishedAt: string;
  durationSeconds: number;
  views: number;
  likes: number;
  comments: number;
  viewsPerDay: number;
  engagementRate: number;
  trend: Trend;
};

export type ChannelSummary = {
  uploadCount: number;
  averageViewsPerDay: number;
  averageEngagementRate: number;
  topPerformer: {
    videoId: string;
    title: string;
    viewsPerDay: number;
  } | null;
};

export type SourceMetadata = {
  provider: "youtube-data-api-v3";
  cache: "memory-ttl" | "none";
};

export type ChannelAnalysis = {
  channel: AnalyzedChannel;
  window: AnalysisWindow;
  summary: ChannelSummary;
  videos: VideoPerformance[];
  source: SourceMetadata;
};

export type AnalysisSnapshot = {
  snapshotId: string;
  label: string | null;
  savedAt: string;
  analysis: ChannelAnalysis;
};
