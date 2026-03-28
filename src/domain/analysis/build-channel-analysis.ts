import type {
  AnalysisFrame,
  AnalysisWindow,
  ChannelAnalysis,
  Trend,
  VideoPerformance,
} from "@/domain/analysis/types";
import type { SourceChannelSnapshot } from "@/ports/competitor-channel-source";

function startOfMonthUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function startOfNextMonthUtc(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
}

function formatMonthKey(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function parseIsoDurationToSeconds(duration: string) {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/u.exec(duration);

  if (!match) {
    return 0;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function calculateMedian(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function toTrendLabel(viewsPerDay: number, medianViewsPerDay: number): Trend {
  if (medianViewsPerDay <= 0) {
    return "steady";
  }

  if (viewsPerDay >= medianViewsPerDay * 1.5) {
    return "hot";
  }

  if (viewsPerDay >= medianViewsPerDay * 1.1) {
    return "above_avg";
  }

  return "steady";
}

function toAnalysisWindow(frame: AnalysisFrame): AnalysisWindow {
  return {
    monthKey: frame.monthKey,
    startAt: frame.startAt,
    endAt: frame.endAt,
  };
}

export function createAnalysisFrame(now: Date): AnalysisFrame {
  const normalizedNow = new Date(now);
  const monthStart = startOfMonthUtc(normalizedNow);
  const monthEnd = startOfNextMonthUtc(normalizedNow);

  return {
    monthKey: formatMonthKey(normalizedNow),
    startAt: monthStart.toISOString(),
    endAt: monthEnd.toISOString(),
    generatedAt: normalizedNow.toISOString(),
  };
}

export function createChannelAnalysis(input: {
  channel: ChannelAnalysis["channel"];
  window: AnalysisWindow;
  source: ChannelAnalysis["source"];
  videos: Array<Omit<VideoPerformance, "trend">>;
}): ChannelAnalysis {
  const medianViewsPerDay = calculateMedian(input.videos.map((video) => video.viewsPerDay));

  const videos: VideoPerformance[] = input.videos
    .map((video) => ({
      ...video,
      trend: toTrendLabel(video.viewsPerDay, medianViewsPerDay),
    }))
    .sort((left, right) => right.viewsPerDay - left.viewsPerDay);

  const averageViewsPerDay =
    videos.length > 0
      ? Math.round(videos.reduce((total, video) => total + video.viewsPerDay, 0) / videos.length)
      : 0;
  const averageEngagementRate =
    videos.length > 0
      ? Number(
          (
            videos.reduce((total, video) => total + video.engagementRate, 0) / videos.length
          ).toFixed(4),
        )
      : 0;

  return {
    channel: input.channel,
    window: input.window,
    summary: {
      uploadCount: videos.length,
      averageViewsPerDay,
      averageEngagementRate,
      topPerformer: videos[0]
        ? {
            videoId: videos[0].id,
            title: videos[0].title,
            viewsPerDay: videos[0].viewsPerDay,
          }
        : null,
    },
    videos,
    source: input.source,
  };
}

export function buildChannelAnalysis(
  snapshot: SourceChannelSnapshot,
  frame: AnalysisFrame,
): ChannelAnalysis {
  const generatedAt = new Date(frame.generatedAt);
  const windowStart = new Date(frame.startAt).getTime();
  const windowEnd = new Date(frame.endAt).getTime();

  const derivedVideos = snapshot.videos
    .filter((video) => {
      const publishedAt = new Date(video.publishedAt).getTime();
      return publishedAt >= windowStart && publishedAt < windowEnd;
    })
    .map((video) => {
      const publishedAt = new Date(video.publishedAt);
      const elapsedMs = generatedAt.getTime() - publishedAt.getTime();
      const elapsedDays = Math.max(1, Math.ceil(elapsedMs / 86_400_000));
      const viewsPerDay = Math.round(video.viewCount / elapsedDays);
      const engagementRate = Number(
        ((video.likeCount + video.commentCount) / Math.max(1, video.viewCount)).toFixed(4),
      );

      return {
        id: video.id,
        title: video.title,
        thumbnailUrl: video.thumbnailUrl,
        publishedAt: video.publishedAt,
        durationSeconds: parseIsoDurationToSeconds(video.duration),
        views: video.viewCount,
        likes: video.likeCount,
        comments: video.commentCount,
        viewsPerDay,
        engagementRate,
      };
    });

  return createChannelAnalysis({
    channel: snapshot.channel,
    window: toAnalysisWindow(frame),
    source: snapshot.source,
    videos: derivedVideos,
  });
}
