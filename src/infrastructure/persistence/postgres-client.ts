import { Pool, type QueryResultRow } from "pg";

let pool: Pool | null = null;
let schemaPromise: Promise<void> | null = null;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for commercial MVP persistence.");
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "development"
          ? false
          : {
              rejectUnauthorized: false,
            },
    });
  }

  return pool;
}

export async function query<T extends QueryResultRow>(text: string, values?: unknown[]) {
  await ensureSchema();
  return getPool().query<T>(text, values);
}

export async function ensureSchema() {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const client = await getPool().connect();

      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS commercial_accounts (
            user_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            plan_id TEXT,
            billing_cycle TEXT,
            seats INTEGER,
            stripe_customer_id TEXT,
            stripe_subscription_id TEXT,
            checkout_session_id TEXT,
            checkout_completed_at TIMESTAMPTZ,
            last_paid_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );

          CREATE UNIQUE INDEX IF NOT EXISTS commercial_accounts_stripe_customer_id_idx
            ON commercial_accounts (stripe_customer_id)
            WHERE stripe_customer_id IS NOT NULL;

          CREATE UNIQUE INDEX IF NOT EXISTS commercial_accounts_stripe_subscription_id_idx
            ON commercial_accounts (stripe_subscription_id)
            WHERE stripe_subscription_id IS NOT NULL;

          CREATE TABLE IF NOT EXISTS saved_reports (
            report_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            label TEXT,
            saved_at TIMESTAMPTZ NOT NULL,
            analysis_json JSONB NOT NULL
          );

          CREATE INDEX IF NOT EXISTS saved_reports_user_id_saved_at_idx
            ON saved_reports (user_id, saved_at DESC);

          CREATE TABLE IF NOT EXISTS tracked_channels (
            tracked_channel_id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            channel_id TEXT NOT NULL,
            channel_title TEXT NOT NULL,
            channel_url TEXT NOT NULL,
            avatar_url TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL,
            refreshed_at TIMESTAMPTZ NOT NULL,
            latest_analysis_json JSONB NOT NULL
          );

          CREATE INDEX IF NOT EXISTS tracked_channels_user_id_created_at_idx
            ON tracked_channels (user_id, created_at DESC);

          CREATE UNIQUE INDEX IF NOT EXISTS tracked_channels_user_id_channel_id_idx
            ON tracked_channels (user_id, channel_id);

          CREATE TABLE IF NOT EXISTS processed_webhook_events (
            event_id TEXT PRIMARY KEY,
            processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
        `);
      } finally {
        client.release();
      }
    })();
  }

  await schemaPromise;
}
