import { describe, expect, it, vi } from "vitest";

import { ApplicationError } from "@/shared/application-error";
import { createAnalyzeRouteHandler } from "@/transport/http/analyze-route";

const payload = {
  channel: {
    id: "channel-1",
    title: "Daily Desk",
    avatarUrl: "https://example.com/avatar.png",
    subscriberCount: 450000,
    channelUrl: "https://www.youtube.com/@dailydesk",
  },
  window: {
    label: "March 2026",
    monthKey: "2026-03",
    startAt: "2026-03-01T00:00:00.000Z",
    endAt: "2026-04-01T00:00:00.000Z",
  },
  summary: {
    uploadCount: 1,
    averageViewsPerDay: 21000,
    averageEngagementRate: 0.048,
    topPerformer: {
      title: "Morning Briefing",
      viewsPerDay: 21000,
      videoUrl: "https://www.youtube.com/watch?v=video-1",
    },
  },
  videos: [],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("createAnalyzeRouteHandler", () => {
  it("returns normalized analysis payloads for valid requests", async () => {
    const handler = createAnalyzeRouteHandler({
      analyzeCompetitorChannel: vi.fn().mockResolvedValue(payload),
    });

    const response = await handler(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({ channelUrl: "https://www.youtube.com/@dailydesk" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(payload);
  });

  it("rejects invalid payloads before hitting the use case", async () => {
    const analyzeCompetitorChannel = vi.fn();
    const handler = createAnalyzeRouteHandler({ analyzeCompetitorChannel });

    const response = await handler(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({ channelUrl: "" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(400);
    expect(analyzeCompetitorChannel).not.toHaveBeenCalled();
  });

  it("maps quota failures to a retryable upstream response", async () => {
    const handler = createAnalyzeRouteHandler({
      analyzeCompetitorChannel: vi
        .fn()
        .mockRejectedValue(
          new ApplicationError("YOUTUBE_QUOTA_EXCEEDED", "YouTube quota exceeded.", 503),
        ),
    });

    const response = await handler(
      new Request("http://localhost/api/analyze", {
        method: "POST",
        body: JSON.stringify({ channelUrl: "https://www.youtube.com/@dailydesk" }),
        headers: { "content-type": "application/json" },
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "YOUTUBE_QUOTA_EXCEEDED",
      },
    });
  });
});
