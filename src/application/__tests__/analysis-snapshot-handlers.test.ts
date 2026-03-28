import { describe, expect, it, vi } from "vitest";

import { createClearAnalysisSnapshotsCommandHandler } from "@/application/commands/clear-analysis-snapshots-command-handler";
import { createSaveAnalysisSnapshotCommandHandler } from "@/application/commands/save-analysis-snapshot-command-handler";
import { toChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createListAnalysisSnapshotsQueryHandler } from "@/application/queries/list-analysis-snapshots-query-handler";
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

describe("analysis snapshot handlers", () => {
  it("saves a snapshot and returns an acknowledgment payload", async () => {
    const analysis = buildChannelAnalysis(snapshot, createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")));
    const repository = {
      save: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
    };
    const handle = createSaveAnalysisSnapshotCommandHandler({
      repository,
      now: () => new Date("2026-03-28T10:15:00.000Z"),
      createSnapshotId: () => "snapshot-1",
    });

    const result = await handle({
      sessionId: "session-1",
      label: "Monday demo",
      analysis: toChannelAnalysisReadModel(analysis),
    });

    expect(repository.save).toHaveBeenCalledWith(
      "session-1",
      expect.objectContaining({
        snapshotId: "snapshot-1",
        label: "Monday demo",
        savedAt: "2026-03-28T10:15:00.000Z",
      }),
    );
    expect(result).toEqual({
      snapshotId: "snapshot-1",
      label: "Monday demo",
      savedAt: "2026-03-28T10:15:00.000Z",
    });
  });

  it("lists saved snapshots from the repository without mutating them", async () => {
    const repository = {
      save: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([
        {
          snapshotId: "snapshot-1",
          label: null,
          savedAt: "2026-03-28T10:15:00.000Z",
          analysis: buildChannelAnalysis(
            snapshot,
            createAnalysisFrame(new Date("2026-03-26T10:00:00.000Z")),
          ),
        },
      ]),
    };
    const handle = createListAnalysisSnapshotsQueryHandler({ repository });

    const result = await handle({ sessionId: "session-1" });

    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.clear).not.toHaveBeenCalled();
    expect(repository.list).toHaveBeenCalledWith("session-1");
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      snapshotId: "snapshot-1",
      analysis: {
        channel: {
          title: "Media Lab",
        },
      },
    });
  });

  it("clears saved snapshots for one browser session", async () => {
    const repository = {
      save: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue([]),
    };
    const handle = createClearAnalysisSnapshotsCommandHandler({ repository });

    await handle({ sessionId: "session-1" });

    expect(repository.save).not.toHaveBeenCalled();
    expect(repository.list).not.toHaveBeenCalled();
    expect(repository.clear).toHaveBeenCalledWith("session-1");
  });
});
