import { describe, expect, it, vi } from "vitest";

import {
  createSavedReportsRouteHandlers,
  createTrackedChannelsRouteHandlers,
} from "@/transport/http/paid-workflows-route";

const analysisPayload = {
  channel: {
    id: "channel-1",
    title: "Media Lab",
    avatarUrl: "https://example.com/avatar.jpg",
    subscriberCount: 1250000,
    channelUrl: "https://www.youtube.com/@medialab",
  },
  window: {
    label: "March 2026",
    monthKey: "2026-03",
    startAt: "2026-03-01T00:00:00.000Z",
    endAt: "2026-04-01T00:00:00.000Z",
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
  videos: [
    {
      id: "velocity-1",
      title: "Breaking Format Explained",
      videoUrl: "https://www.youtube.com/watch?v=velocity-1",
      thumbnailUrl: "https://example.com/v1.jpg",
      publishedAt: "2026-03-24T10:00:00.000Z",
      durationText: "8:14",
      views: 120000,
      likes: 5400,
      comments: 760,
      viewsPerDay: 60000,
      engagementRate: 0.0513,
      trend: "steady" as const,
    },
  ],
  source: {
    provider: "youtube-data-api-v3" as const,
    cache: "memory-ttl" as const,
  },
};

describe("paid workflow route handlers", () => {
  it("requires auth to list saved reports", async () => {
    const { GET } = createSavedReportsRouteHandlers({
      listSavedReports: vi.fn(),
      saveSavedReport: vi.fn(),
      getAuthenticatedUser: vi.fn().mockResolvedValue(null),
    });

    const response = await GET(new Request("http://localhost/api/saved-reports"));

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "UNAUTHORIZED",
        message: "Sign in to view saved reports.",
      },
    });
  });

  it("rejects saved report writes from untrusted origins", async () => {
    const saveSavedReport = vi.fn();
    const { POST } = createSavedReportsRouteHandlers({
      listSavedReports: vi.fn(),
      saveSavedReport,
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/saved-reports", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "https://evil.example",
        },
        body: JSON.stringify({
          analysis: analysisPayload,
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(saveSavedReport).not.toHaveBeenCalled();
  });

  it("uses the authenticated user id when listing tracked channels", async () => {
    const listTrackedChannels = vi.fn().mockResolvedValue([]);
    const { GET } = createTrackedChannelsRouteHandlers({
      listTrackedChannels,
      saveTrackedChannel: vi.fn(),
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await GET(new Request("http://localhost/api/tracked-channels"));

    expect(listTrackedChannels).toHaveBeenCalledWith({
      userId: "user_123",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      trackedChannels: [],
    });
  });

  it("persists tracked channels only for trusted origins", async () => {
    const saveTrackedChannel = vi.fn().mockResolvedValue({
      trackedAt: "2026-03-28T10:15:00.000Z",
    });
    const { POST } = createTrackedChannelsRouteHandlers({
      listTrackedChannels: vi.fn(),
      saveTrackedChannel,
      getAuthenticatedUser: vi.fn().mockResolvedValue({
        userId: "user_123",
        email: "alex@agency.com",
        name: "Alex Rivera",
      }),
    });

    const response = await POST(
      new Request("http://localhost/api/tracked-channels", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          origin: "http://localhost",
        },
        body: JSON.stringify({
          analysis: analysisPayload,
        }),
      }),
    );

    expect(saveTrackedChannel).toHaveBeenCalledWith({
      userId: "user_123",
      analysis: analysisPayload,
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      trackedAt: "2026-03-28T10:15:00.000Z",
    });
  });
});
