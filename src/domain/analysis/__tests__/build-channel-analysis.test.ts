import { describe, expect, it } from "vitest";

import { buildChannelAnalysis, createAnalysisFrame } from "@/domain/analysis/build-channel-analysis";
import type { SourceChannelSnapshot } from "@/ports/competitor-channel-source";

const snapshot: SourceChannelSnapshot = {
  channel: {
    id: "channel-1",
    title: "Media Lab",
    avatarUrl: "https://example.com/avatar.jpg",
    subscriberCount: 1250000,
    channelUrl: "https://www.youtube.com/@medialab",
  },
  videos: [
    {
      id: "velocity-1",
      title: "Breaking Format Explained",
      publishedAt: "2026-03-24T10:00:00.000Z",
      duration: "PT8M14S",
      viewCount: 120000,
      likeCount: 5400,
      commentCount: 760,
      thumbnailUrl: "https://example.com/v1.jpg",
    },
    {
      id: "velocity-2",
      title: "Weekly Industry Pulse",
      publishedAt: "2026-03-21T10:00:00.000Z",
      duration: "PT12M5S",
      viewCount: 140000,
      likeCount: 4500,
      commentCount: 380,
      thumbnailUrl: "https://example.com/v2.jpg",
    },
    {
      id: "velocity-3",
      title: "Behind the Headlines",
      publishedAt: "2026-03-16T10:00:00.000Z",
      duration: "PT18M44S",
      viewCount: 200000,
      likeCount: 3800,
      commentCount: 240,
      thumbnailUrl: "https://example.com/v3.jpg",
    },
    {
      id: "velocity-4",
      title: "Long Tail Commentary",
      publishedAt: "2026-03-05T10:00:00.000Z",
      duration: "PT22M12S",
      viewCount: 85000,
      likeCount: 900,
      commentCount: 85,
      thumbnailUrl: "https://example.com/v4.jpg",
    },
  ],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("buildChannelAnalysis", () => {
  it("calculates derived metrics and sorts videos by views per day", () => {
    const analysis = buildChannelAnalysis(
      snapshot,
      createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")),
    );

    expect(analysis.videos.map((video) => video.id)).toEqual([
      "velocity-1",
      "velocity-2",
      "velocity-3",
      "velocity-4",
    ]);

    expect(analysis.videos[0]).toMatchObject({
      id: "velocity-1",
      durationSeconds: 494,
      viewsPerDay: 60000,
      trend: "hot",
    });

    expect(analysis.videos[1]).toMatchObject({
      id: "velocity-2",
      viewsPerDay: 28000,
      trend: "above_avg",
    });
  });

  it("builds summary metrics for the dashboard cards", () => {
    const analysis = buildChannelAnalysis(
      snapshot,
      createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")),
    );

    expect(analysis.window).toEqual({
      monthKey: "2026-03",
      startAt: "2026-03-01T00:00:00.000Z",
      endAt: "2026-04-01T00:00:00.000Z",
    });
    expect(analysis.summary.uploadCount).toBe(4);
    expect(analysis.summary.averageViewsPerDay).toBe(28012);
    expect(analysis.summary.averageEngagementRate).toBe(0.0295);
    expect(analysis.summary.topPerformer).toMatchObject({
      videoId: "velocity-1",
      title: "Breaking Format Explained",
      viewsPerDay: 60000,
    });
  });
});
