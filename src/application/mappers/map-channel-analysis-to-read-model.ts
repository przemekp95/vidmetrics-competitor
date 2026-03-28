import { createChannelAnalysis } from "@/domain/analysis/build-channel-analysis";
import type { AnalysisSnapshot, ChannelAnalysis } from "@/domain/analysis/types";
import type {
  AnalysisSnapshotReadModel,
  ChannelAnalysisReadModel,
} from "@/application/read-models/analysis-read-model";
import { durationTextToSeconds } from "@/lib/formatters";

function formatMonthWindowLabel(startAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(startAt));
}

function formatDurationText(durationSeconds: number) {
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function toVideoUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export function toChannelAnalysisReadModel(analysis: ChannelAnalysis): ChannelAnalysisReadModel {
  return {
    channel: analysis.channel,
    window: {
      ...analysis.window,
      label: formatMonthWindowLabel(analysis.window.startAt),
    },
    summary: {
      uploadCount: analysis.summary.uploadCount,
      averageViewsPerDay: analysis.summary.averageViewsPerDay,
      averageEngagementRate: analysis.summary.averageEngagementRate,
      topPerformer: analysis.summary.topPerformer
        ? {
            title: analysis.summary.topPerformer.title,
            viewsPerDay: analysis.summary.topPerformer.viewsPerDay,
            videoUrl: toVideoUrl(analysis.summary.topPerformer.videoId),
          }
        : null,
    },
    videos: analysis.videos.map((video) => ({
      id: video.id,
      title: video.title,
      videoUrl: toVideoUrl(video.id),
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.publishedAt,
      durationText: formatDurationText(video.durationSeconds),
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      viewsPerDay: video.viewsPerDay,
      engagementRate: video.engagementRate,
      trend: video.trend,
    })),
    source: analysis.source,
  };
}

export function fromChannelAnalysisReadModel(readModel: ChannelAnalysisReadModel): ChannelAnalysis {
  return createChannelAnalysis({
    channel: readModel.channel,
    window: {
      monthKey: readModel.window.monthKey,
      startAt: readModel.window.startAt,
      endAt: readModel.window.endAt,
    },
    source: readModel.source,
    videos: readModel.videos.map((video) => ({
      id: video.id,
      title: video.title,
      thumbnailUrl: video.thumbnailUrl,
      publishedAt: video.publishedAt,
      durationSeconds: durationTextToSeconds(video.durationText),
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      viewsPerDay: video.viewsPerDay,
      engagementRate: video.engagementRate,
    })),
  });
}

export function toAnalysisSnapshotReadModel(
  snapshot: AnalysisSnapshot,
): AnalysisSnapshotReadModel {
  return {
    snapshotId: snapshot.snapshotId,
    label: snapshot.label,
    savedAt: snapshot.savedAt,
    channel: {
      title: snapshot.analysis.channel.title,
      channelUrl: snapshot.analysis.channel.channelUrl,
      avatarUrl: snapshot.analysis.channel.avatarUrl,
    },
    window: {
      label: formatMonthWindowLabel(snapshot.analysis.window.startAt),
      monthKey: snapshot.analysis.window.monthKey,
    },
    topPerformer: snapshot.analysis.summary.topPerformer
      ? {
          title: snapshot.analysis.summary.topPerformer.title,
          viewsPerDay: snapshot.analysis.summary.topPerformer.viewsPerDay,
          videoUrl: toVideoUrl(snapshot.analysis.summary.topPerformer.videoId),
        }
      : null,
  };
}
