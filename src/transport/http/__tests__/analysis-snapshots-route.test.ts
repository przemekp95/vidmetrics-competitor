import { describe, expect, it, vi } from "vitest";

import { createAnalysisSnapshotsRouteHandlers } from "@/transport/http/analysis-snapshots-route";

const analysis = {
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
  videos: [
    {
      id: "video-1",
      title: "Morning Briefing",
      videoUrl: "https://www.youtube.com/watch?v=video-1",
      thumbnailUrl: "https://example.com/video-1.png",
      publishedAt: "2026-03-25T10:00:00.000Z",
      durationText: "9:12",
      views: 21000,
      likes: 1000,
      comments: 120,
      viewsPerDay: 21000,
      engagementRate: 0.0533,
      trend: "hot",
    },
  ],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("createAnalysisSnapshotsRouteHandlers", () => {
  it("rejects requests without a browser session header", async () => {
    const handlers = createAnalysisSnapshotsRouteHandlers({
      saveAnalysisSnapshot: vi.fn(),
      listAnalysisSnapshots: vi.fn(),
      clearAnalysisSnapshots: vi.fn(),
    });

    const response = await handlers.GET(new Request("http://localhost/api/analysis-snapshots"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "MISSING_SESSION",
        message: "Open a fresh browser session and try again.",
      },
    });
  });

  it("saves a posted snapshot for the active browser session", async () => {
    const saveAnalysisSnapshot = vi.fn().mockResolvedValue({
      snapshotId: "snapshot-1",
      label: null,
      savedAt: "2026-03-28T10:15:00.000Z",
    });
    const handlers = createAnalysisSnapshotsRouteHandlers({
      saveAnalysisSnapshot,
      listAnalysisSnapshots: vi.fn(),
      clearAnalysisSnapshots: vi.fn(),
    });

    const response = await handlers.POST(
      new Request("http://localhost/api/analysis-snapshots", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": "session-1",
        },
        body: JSON.stringify({ analysis }),
      }),
    );

    expect(saveAnalysisSnapshot).toHaveBeenCalledWith({
      sessionId: "session-1",
      analysis,
    });
    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      snapshotId: "snapshot-1",
      label: null,
      savedAt: "2026-03-28T10:15:00.000Z",
    });
  });

  it("lists saved snapshots only for the active browser session", async () => {
    const listAnalysisSnapshots = vi.fn().mockResolvedValue([
      {
        snapshotId: "snapshot-1",
        label: null,
        savedAt: "2026-03-28T10:15:00.000Z",
        channel: {
          title: "Daily Desk",
          channelUrl: "https://www.youtube.com/@dailydesk",
          avatarUrl: "https://example.com/avatar.png",
        },
        window: {
          label: "March 2026",
          monthKey: "2026-03",
        },
        topPerformer: {
          title: "Morning Briefing",
          viewsPerDay: 21000,
          videoUrl: "https://www.youtube.com/watch?v=video-1",
        },
      },
    ]);
    const handlers = createAnalysisSnapshotsRouteHandlers({
      saveAnalysisSnapshot: vi.fn(),
      listAnalysisSnapshots,
      clearAnalysisSnapshots: vi.fn(),
    });

    const response = await handlers.GET(
      new Request("http://localhost/api/analysis-snapshots", {
        headers: {
          "x-vidmetrics-session-id": "session-1",
        },
      }),
    );

    expect(listAnalysisSnapshots).toHaveBeenCalledWith({ sessionId: "session-1" });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      snapshots: [
        {
          snapshotId: "snapshot-1",
          label: null,
          savedAt: "2026-03-28T10:15:00.000Z",
          channel: {
            title: "Daily Desk",
            channelUrl: "https://www.youtube.com/@dailydesk",
            avatarUrl: "https://example.com/avatar.png",
          },
          window: {
            label: "March 2026",
            monthKey: "2026-03",
          },
          topPerformer: {
            title: "Morning Briefing",
            viewsPerDay: 21000,
            videoUrl: "https://www.youtube.com/watch?v=video-1",
          },
        },
      ],
    });
  });

  it("clears saved snapshots for the active browser session", async () => {
    const clearAnalysisSnapshots = vi.fn().mockResolvedValue(undefined);
    const handlers = createAnalysisSnapshotsRouteHandlers({
      saveAnalysisSnapshot: vi.fn(),
      listAnalysisSnapshots: vi.fn(),
      clearAnalysisSnapshots,
    });

    const response = await handlers.DELETE(
      new Request("http://localhost/api/analysis-snapshots", {
        method: "DELETE",
        headers: {
          "x-vidmetrics-session-id": "session-1",
        },
      }),
    );

    expect(clearAnalysisSnapshots).toHaveBeenCalledWith({ sessionId: "session-1" });
    expect(response.status).toBe(204);
  });
});
