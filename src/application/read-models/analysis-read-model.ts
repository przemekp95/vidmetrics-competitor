import type { Trend } from "@/domain/analysis/types";

export type ChannelAnalysisReadModel = {
  channel: {
    id: string;
    title: string;
    avatarUrl: string;
    subscriberCount: number;
    channelUrl: string;
  };
  window: {
    label: string;
    monthKey: string;
    startAt: string;
    endAt: string;
  };
  summary: {
    uploadCount: number;
    averageViewsPerDay: number;
    averageEngagementRate: number;
    topPerformer: {
      title: string;
      viewsPerDay: number;
      videoUrl: string;
    } | null;
  };
  videos: Array<{
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
    trend: Trend;
  }>;
  source: {
    provider: "youtube-data-api-v3";
    cache: "memory-ttl" | "none";
  };
};

export type CompetitorVideoReadModel = ChannelAnalysisReadModel["videos"][number];

export type SaveAnalysisSnapshotResponse = {
  snapshotId: string;
  label: string | null;
  savedAt: string;
};

export type AnalysisSnapshotReadModel = {
  snapshotId: string;
  label: string | null;
  savedAt: string;
  channel: {
    title: string;
    channelUrl: string;
    avatarUrl: string;
  };
  window: {
    label: string;
    monthKey: string;
  };
  topPerformer: {
    title: string;
    viewsPerDay: number;
    videoUrl: string;
  } | null;
};
