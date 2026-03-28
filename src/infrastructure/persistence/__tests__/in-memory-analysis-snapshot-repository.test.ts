import { describe, expect, it } from "vitest";

import { createInMemoryAnalysisSnapshotRepository } from "@/infrastructure/persistence/in-memory-analysis-snapshot-repository";
import type { AnalysisSnapshot } from "@/domain/analysis/types";

const baseSnapshot: AnalysisSnapshot = {
  snapshotId: "snapshot-1",
  label: null,
  savedAt: "2026-03-28T10:15:00.000Z",
  analysis: {
    window: {
      startAt: "2026-03-01T00:00:00.000Z",
      endAt: "2026-04-01T00:00:00.000Z",
      monthKey: "2026-03",
    },
    channel: {
      id: "channel-1",
      title: "Media Lab",
      avatarUrl: "https://example.com/avatar.png",
      subscriberCount: 1000,
      channelUrl: "https://www.youtube.com/@medialab",
    },
    videos: [],
    summary: {
      uploadCount: 0,
      averageViewsPerDay: 0,
      averageEngagementRate: 0,
      topPerformer: null,
    },
    source: {
      provider: "youtube-data-api-v3",
      cache: "memory-ttl",
    },
  },
};

describe("createInMemoryAnalysisSnapshotRepository", () => {
  it("isolates snapshots by browser session id", async () => {
    const repository = createInMemoryAnalysisSnapshotRepository();

    await repository.save("session-a", baseSnapshot);
    await repository.save("session-b", {
      ...baseSnapshot,
      snapshotId: "snapshot-2",
      label: "Other browser",
    });

    await expect(repository.list("session-a")).resolves.toEqual([baseSnapshot]);
    await expect(repository.list("session-b")).resolves.toEqual([
      {
        ...baseSnapshot,
        snapshotId: "snapshot-2",
        label: "Other browser",
      },
    ]);
  });

  it("clears snapshots only for the requested session", async () => {
    const repository = createInMemoryAnalysisSnapshotRepository();

    await repository.save("session-a", baseSnapshot);
    await repository.save("session-b", {
      ...baseSnapshot,
      snapshotId: "snapshot-2",
    });

    await repository.clear("session-a");

    await expect(repository.list("session-a")).resolves.toEqual([]);
    await expect(repository.list("session-b")).resolves.toEqual([
      {
        ...baseSnapshot,
        snapshotId: "snapshot-2",
      },
    ]);
  });
});
