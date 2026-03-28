import type { ChannelAnalysis } from "@/domain/analysis/types";

export type TrackedChannel = {
  trackedChannelId: string;
  userId: string;
  channelId: string;
  channelTitle: string;
  channelUrl: string;
  avatarUrl: string;
  createdAt: string;
  refreshedAt: string;
  latestAnalysis: ChannelAnalysis;
};

export interface TrackedChannelRepository {
  save(trackedChannel: TrackedChannel): Promise<void>;
  list(userId: string): Promise<TrackedChannel[]>;
}
