import type { ProcessedWebhookEventRepository } from "@/ports/processed-webhook-event-repository";
import { query } from "@/infrastructure/persistence/postgres-client";

type ProcessedWebhookEventRow = {
  event_id: string;
};

export function createPostgresProcessedWebhookEventRepository(): ProcessedWebhookEventRepository {
  return {
    async hasProcessed(eventId) {
      const result = await query<ProcessedWebhookEventRow>(
        `SELECT event_id FROM processed_webhook_events WHERE event_id = $1`,
        [eventId],
      );

      return (result.rowCount ?? 0) > 0;
    },
    async markProcessed(eventId) {
      await query(
        `INSERT INTO processed_webhook_events (event_id)
         VALUES ($1)
         ON CONFLICT (event_id)
         DO NOTHING`,
        [eventId],
      );
    },
  };
}
