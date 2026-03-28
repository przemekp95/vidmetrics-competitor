import { describe, expect, it, vi } from "vitest";

import { createAnalyzeCompetitorChannelQueryHandler } from "@/application/queries/analyze-competitor-channel-query-handler";
import type { SourceChannelSnapshot } from "@/ports/competitor-channel-source";

const snapshot: SourceChannelSnapshot = {
  channel: {
    id: "channel-9",
    title: "Publisher One",
    avatarUrl: "https://example.com/avatar.png",
    subscriberCount: 890000,
    channelUrl: "https://www.youtube.com/@publisherone",
  },
  videos: [
    {
      id: "video-1",
      title: "Election Night Recap",
      publishedAt: "2026-03-25T10:00:00.000Z",
      duration: "PT9M35S",
      viewCount: 40000,
      likeCount: 1400,
      commentCount: 210,
      thumbnailUrl: "https://example.com/video-1.png",
    },
  ],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("createAnalyzeCompetitorChannelQueryHandler", () => {
  it("coordinates the resolver and source to build the domain analysis", async () => {
    const resolver = {
      resolve: vi.fn().mockResolvedValue({ type: "handle" as const, value: "publisherone" }),
    };
    const source = {
      fetchCurrentMonthVideos: vi.fn().mockResolvedValue(snapshot),
    };
    const handle = createAnalyzeCompetitorChannelQueryHandler({
      resolver,
      source,
      now: () => new Date("2026-03-26T10:00:00.000Z"),
    });

    const result = await handle({ channelUrl: "https://www.youtube.com/@publisherone" });

    expect(resolver.resolve).toHaveBeenCalledWith("https://www.youtube.com/@publisherone");
    expect(source.fetchCurrentMonthVideos).toHaveBeenCalledWith(
      expect.objectContaining({
        lookup: { type: "handle", value: "publisherone" },
        maxVideos: 100,
      }),
    );
    expect(result.channel.title).toBe("Publisher One");
    expect(result.summary.uploadCount).toBe(1);
    expect(result.videos[0]).toMatchObject({
      id: "video-1",
      durationSeconds: 575,
      viewsPerDay: 40000,
    });
  });

  it("returns a valid empty state when the channel has no uploads in the current month", async () => {
    const handle = createAnalyzeCompetitorChannelQueryHandler({
      resolver: {
        resolve: vi.fn().mockResolvedValue({ type: "id" as const, value: "channel-9" }),
      },
      source: {
        fetchCurrentMonthVideos: vi.fn().mockResolvedValue({
          channel: snapshot.channel,
          videos: [],
          source: snapshot.source,
        }),
      },
      now: () => new Date("2026-03-26T10:00:00.000Z"),
    });

    const result = await handle({ channelUrl: "https://www.youtube.com/channel/channel-9" });

    expect(result.summary.uploadCount).toBe(0);
    expect(result.videos).toEqual([]);
  });
});
