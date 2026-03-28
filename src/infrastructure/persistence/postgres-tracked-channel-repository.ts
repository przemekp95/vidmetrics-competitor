import type { TrackedChannel, TrackedChannelRepository } from "@/ports/tracked-channel-repository";
import { query } from "@/infrastructure/persistence/postgres-client";

type TrackedChannelRow = {
  tracked_channel_id: string;
  user_id: string;
  channel_id: string;
  channel_title: string;
  channel_url: string;
  avatar_url: string;
  created_at: string;
  refreshed_at: string;
  latest_analysis_json: TrackedChannel["latestAnalysis"];
};

export function createPostgresTrackedChannelRepository(): TrackedChannelRepository {
  return {
    async save(trackedChannel) {
      await query(
        `INSERT INTO tracked_channels (
           tracked_channel_id, user_id, channel_id, channel_title, channel_url, avatar_url,
           created_at, refreshed_at, latest_analysis_json
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (user_id, channel_id)
         DO UPDATE SET
           tracked_channel_id = EXCLUDED.tracked_channel_id,
           channel_title = EXCLUDED.channel_title,
           channel_url = EXCLUDED.channel_url,
           avatar_url = EXCLUDED.avatar_url,
           refreshed_at = EXCLUDED.refreshed_at,
           latest_analysis_json = EXCLUDED.latest_analysis_json`,
        [
          trackedChannel.trackedChannelId,
          trackedChannel.userId,
          trackedChannel.channelId,
          trackedChannel.channelTitle,
          trackedChannel.channelUrl,
          trackedChannel.avatarUrl,
          trackedChannel.createdAt,
          trackedChannel.refreshedAt,
          JSON.stringify(trackedChannel.latestAnalysis),
        ],
      );
    },
    async list(userId) {
      const result = await query<TrackedChannelRow>(
        `SELECT tracked_channel_id, user_id, channel_id, channel_title, channel_url, avatar_url,
                created_at::text, refreshed_at::text, latest_analysis_json
           FROM tracked_channels
          WHERE user_id = $1
          ORDER BY created_at DESC`,
        [userId],
      );

      return result.rows.map((row) => ({
        trackedChannelId: row.tracked_channel_id,
        userId: row.user_id,
        channelId: row.channel_id,
        channelTitle: row.channel_title,
        channelUrl: row.channel_url,
        avatarUrl: row.avatar_url,
        createdAt: row.created_at,
        refreshedAt: row.refreshed_at,
        latestAnalysis: row.latest_analysis_json,
      }));
    },
  };
}
