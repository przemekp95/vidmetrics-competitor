import { describe, expect, it } from "vitest";

import {
  fromChannelAnalysisReadModel,
  toAnalysisSnapshotReadModel,
  toChannelAnalysisReadModel,
} from "@/application/mappers/map-channel-analysis-to-read-model";
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
  ],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("channel analysis read model mappers", () => {
  it("adds presentation fields outside the domain model", () => {
    const analysis = buildChannelAnalysis(snapshot, createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")));

    const readModel = toChannelAnalysisReadModel(analysis);

    expect(readModel.window.label).toBe("March 2026");
    expect(readModel.videos[0]).toMatchObject({
      videoUrl: "https://www.youtube.com/watch?v=velocity-1",
      durationText: "8:14",
      views: 120000,
    });
    expect(readModel.summary.topPerformer?.videoUrl).toBe("https://www.youtube.com/watch?v=velocity-1");
  });

  it("can rebuild a domain analysis from the read model without presentation-only fields", () => {
    const analysis = buildChannelAnalysis(snapshot, createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")));

    const rebuilt = fromChannelAnalysisReadModel(toChannelAnalysisReadModel(analysis));

    expect(rebuilt.videos[0]).toMatchObject({
      id: "velocity-1",
      durationSeconds: 494,
      views: 120000,
      trend: "steady",
    });
    expect(rebuilt.summary.topPerformer).toMatchObject({
      videoId: "velocity-1",
    });
  });

  it("maps a saved snapshot to the list read model used by the current-session UI", () => {
    const analysis = buildChannelAnalysis(snapshot, createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")));

    const readModel = toAnalysisSnapshotReadModel({
      snapshotId: "snapshot-1",
      label: "Monday demo",
      savedAt: "2026-03-28T10:15:00.000Z",
      analysis,
    });

    expect(readModel).toEqual({
      snapshotId: "snapshot-1",
      label: "Monday demo",
      savedAt: "2026-03-28T10:15:00.000Z",
      channel: {
        title: "Media Lab",
        channelUrl: "https://www.youtube.com/@medialab",
        avatarUrl: "https://example.com/avatar.jpg",
      },
      window: {
        label: "March 2026",
        monthKey: "2026-03",
      },
      summary: {
        uploadCount: 1,
        averageViewsPerDay: 60000,
        averageEngagementRate: 0.0513,
        topPerformer: {
          title: "Breaking Format Explained",
          viewsPerDay: 60000,
          videoUrl: "https://www.youtube.com/watch?v=velocity-1",
        },
      },
      topPerformer: {
        title: "Breaking Format Explained",
        viewsPerDay: 60000,
        videoUrl: "https://www.youtube.com/watch?v=velocity-1",
      },
    });
  });
});
