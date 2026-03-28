import { describe, expect, it, vi } from "vitest";

import { createSaveSavedReportCommandHandler } from "@/application/commands/save-saved-report-command-handler";
import { createSaveTrackedChannelCommandHandler } from "@/application/commands/save-tracked-channel-command-handler";
import { createListSavedReportsQueryHandler } from "@/application/queries/list-saved-reports-query-handler";
import { createListTrackedChannelsQueryHandler } from "@/application/queries/list-tracked-channels-query-handler";
import type { ChannelAnalysisReadModel } from "@/application/read-models/analysis-read-model";
import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";

const analysisReadModel: ChannelAnalysisReadModel = {
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
      trend: "steady",
    },
  ],
  source: {
    provider: "youtube-data-api-v3",
    cache: "memory-ttl",
  },
};

describe("paid workflow handlers", () => {
  it("rejects saving durable reports before the account is active", async () => {
    const handle = createSaveSavedReportCommandHandler({
      commercialSubscriptionRepository: {
        getByUserId: vi.fn().mockResolvedValue(CommercialAccount.create("user_123")),
        getByStripeCustomerId: vi.fn(),
        getByStripeSubscriptionId: vi.fn(),
        getByCheckoutSessionId: vi.fn(),
        save: vi.fn(),
      },
      savedReportRepository: {
        save: vi.fn(),
        list: vi.fn(),
      },
    });

    await expect(
      handle({
        userId: "user_123",
        analysis: analysisReadModel,
      }),
    ).rejects.toMatchObject({
      code: "FEATURE_LOCKED",
      status: 403,
    });
  });

  it("rejects saving tracked channels before the account is active", async () => {
    const handle = createSaveTrackedChannelCommandHandler({
      commercialSubscriptionRepository: {
        getByUserId: vi.fn().mockResolvedValue(CommercialAccount.create("user_123")),
        getByStripeCustomerId: vi.fn(),
        getByStripeSubscriptionId: vi.fn(),
        getByCheckoutSessionId: vi.fn(),
        save: vi.fn(),
      },
      trackedChannelRepository: {
        save: vi.fn(),
        list: vi.fn().mockResolvedValue([]),
      },
    });

    await expect(
      handle({
        userId: "user_123",
        analysis: analysisReadModel,
      }),
    ).rejects.toMatchObject({
      code: "FEATURE_LOCKED",
      status: 403,
    });
  });

  it("lists durable reports for an active account only", async () => {
    const list = vi.fn().mockResolvedValue([
      {
        snapshotId: "report_123",
        label: "Weekly client report",
        savedAt: "2026-03-28T10:15:00.000Z",
        analysis: {
          channel: {
            id: "channel-1",
            title: "Media Lab",
            avatarUrl: "https://example.com/avatar.jpg",
            subscriberCount: 1250000,
            channelUrl: "https://www.youtube.com/@medialab",
          },
          window: {
            monthKey: "2026-03",
            startAt: "2026-03-01T00:00:00.000Z",
            endAt: "2026-04-01T00:00:00.000Z",
          },
          summary: {
            uploadCount: 1,
            averageViewsPerDay: 60000,
            averageEngagementRate: 0.0513,
            topPerformer: {
              videoId: "velocity-1",
              title: "Breaking Format Explained",
              viewsPerDay: 60000,
            },
          },
          videos: [],
          source: {
            provider: "youtube-data-api-v3",
            cache: "memory-ttl",
          },
        },
      },
    ]);
    const handle = createListSavedReportsQueryHandler({
      commercialSubscriptionRepository: {
        getByUserId: vi
          .fn()
          .mockResolvedValue(CommercialAccount.rehydrate({ userId: "user_123", status: "active", selection: null })),
        getByStripeCustomerId: vi.fn(),
        getByStripeSubscriptionId: vi.fn(),
        getByCheckoutSessionId: vi.fn(),
        save: vi.fn(),
      },
      savedReportRepository: {
        save: vi.fn(),
        list,
      },
    });

    const reports = await handle({ userId: "user_123" });

    expect(list).toHaveBeenCalledWith("user_123");
    expect(reports).toHaveLength(1);
  });

  it("lists tracked channels for an active account only", async () => {
    const list = vi.fn().mockResolvedValue([
      {
        trackedChannelId: "tracked_123",
        userId: "user_123",
        channelId: "channel-1",
        channelTitle: "Media Lab",
        channelUrl: "https://www.youtube.com/@medialab",
        avatarUrl: "https://example.com/avatar.jpg",
        createdAt: "2026-03-28T10:15:00.000Z",
        refreshedAt: "2026-03-28T10:15:00.000Z",
        latestAnalysis: {
          channel: {
            id: "channel-1",
            title: "Media Lab",
            avatarUrl: "https://example.com/avatar.jpg",
            subscriberCount: 1250000,
            channelUrl: "https://www.youtube.com/@medialab",
          },
          window: {
            monthKey: "2026-03",
            startAt: "2026-03-01T00:00:00.000Z",
            endAt: "2026-04-01T00:00:00.000Z",
          },
          summary: {
            uploadCount: 1,
            averageViewsPerDay: 60000,
            averageEngagementRate: 0.0513,
            topPerformer: {
              videoId: "velocity-1",
              title: "Breaking Format Explained",
              viewsPerDay: 60000,
            },
          },
          videos: [],
          source: {
            provider: "youtube-data-api-v3",
            cache: "memory-ttl",
          },
        },
      },
    ]);
    const handle = createListTrackedChannelsQueryHandler({
      commercialSubscriptionRepository: {
        getByUserId: vi
          .fn()
          .mockResolvedValue(CommercialAccount.rehydrate({ userId: "user_123", status: "active", selection: null })),
        getByStripeCustomerId: vi.fn(),
        getByStripeSubscriptionId: vi.fn(),
        getByCheckoutSessionId: vi.fn(),
        save: vi.fn(),
      },
      trackedChannelRepository: {
        save: vi.fn(),
        list,
      },
    });

    const trackedChannels = await handle({ userId: "user_123" });

    expect(list).toHaveBeenCalledWith("user_123");
    expect(trackedChannels).toHaveLength(1);
  });
});
