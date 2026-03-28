import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import { UpgradeCatalogPolicy } from "@/domain/commercial-upgrade/upgrade-catalog-policy";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { UpgradeCatalogProvider } from "@/ports/upgrade-catalog-provider";
import { query } from "@/infrastructure/persistence/postgres-client";

type CommercialAccountRow = {
  user_id: string;
  status: Parameters<typeof CommercialAccount.rehydrate>[0]["status"];
  plan_id: string | null;
  billing_cycle: string | null;
  seats: number | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  checkout_session_id: string | null;
  checkout_completed_at: string | null;
  last_paid_at: string | null;
};

export function createPostgresCommercialSubscriptionRepository({
  catalogProvider,
}: {
  catalogProvider: UpgradeCatalogProvider;
}): CommercialSubscriptionRepository {
  return {
    async getByUserId(userId) {
      const result = await query<CommercialAccountRow>(
        `SELECT user_id, status, plan_id, billing_cycle, seats, stripe_customer_id,
                stripe_subscription_id, checkout_session_id,
                checkout_completed_at::text, last_paid_at::text
           FROM commercial_accounts
          WHERE user_id = $1`,
        [userId],
      );

      return toCommercialAccount(result.rows[0] ?? null, catalogProvider);
    },
    async getByStripeCustomerId(stripeCustomerId) {
      const result = await query<CommercialAccountRow>(
        `SELECT user_id, status, plan_id, billing_cycle, seats, stripe_customer_id,
                stripe_subscription_id, checkout_session_id,
                checkout_completed_at::text, last_paid_at::text
           FROM commercial_accounts
          WHERE stripe_customer_id = $1`,
        [stripeCustomerId],
      );

      return toCommercialAccount(result.rows[0] ?? null, catalogProvider);
    },
    async getByStripeSubscriptionId(stripeSubscriptionId) {
      const result = await query<CommercialAccountRow>(
        `SELECT user_id, status, plan_id, billing_cycle, seats, stripe_customer_id,
                stripe_subscription_id, checkout_session_id,
                checkout_completed_at::text, last_paid_at::text
           FROM commercial_accounts
          WHERE stripe_subscription_id = $1`,
        [stripeSubscriptionId],
      );

      return toCommercialAccount(result.rows[0] ?? null, catalogProvider);
    },
    async getByCheckoutSessionId(checkoutSessionId) {
      const result = await query<CommercialAccountRow>(
        `SELECT user_id, status, plan_id, billing_cycle, seats, stripe_customer_id,
                stripe_subscription_id, checkout_session_id,
                checkout_completed_at::text, last_paid_at::text
           FROM commercial_accounts
          WHERE checkout_session_id = $1`,
        [checkoutSessionId],
      );

      return toCommercialAccount(result.rows[0] ?? null, catalogProvider);
    },
    async save(account) {
      const summary = account.toSummary();
      await query(
        `INSERT INTO commercial_accounts (
           user_id, status, plan_id, billing_cycle, seats, stripe_customer_id,
           stripe_subscription_id, checkout_session_id, checkout_completed_at, last_paid_at
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (user_id)
         DO UPDATE SET
           status = EXCLUDED.status,
           plan_id = EXCLUDED.plan_id,
           billing_cycle = EXCLUDED.billing_cycle,
           seats = EXCLUDED.seats,
           stripe_customer_id = EXCLUDED.stripe_customer_id,
           stripe_subscription_id = EXCLUDED.stripe_subscription_id,
           checkout_session_id = EXCLUDED.checkout_session_id,
           checkout_completed_at = EXCLUDED.checkout_completed_at,
           last_paid_at = EXCLUDED.last_paid_at,
           updated_at = NOW()`,
        [
          account.getUserId(),
          summary.status,
          summary.planId,
          summary.billingCycle,
          summary.seats,
          summary.stripeCustomerId,
          summary.stripeSubscriptionId,
          summary.checkoutSessionId,
          summary.checkoutCompletedAt,
          summary.lastPaidAt,
        ],
      );
    },
  };
}

async function toCommercialAccount(
  row: CommercialAccountRow | null,
  catalogProvider: UpgradeCatalogProvider,
) {
  if (!row) {
    return null;
  }

  const catalog = await catalogProvider.getCatalog();
  const selection =
    row.plan_id && row.billing_cycle && row.seats
      ? new UpgradeCatalogPolicy(catalog).createSelection({
          planId: row.plan_id as "team" | "enterprise",
          billingCycle: row.billing_cycle,
          seats: row.seats,
        })
      : null;

  return CommercialAccount.rehydrate({
    userId: row.user_id,
    status: row.status,
    selection,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    checkoutSessionId: row.checkout_session_id,
    checkoutCompletedAt: row.checkout_completed_at,
    lastPaidAt: row.last_paid_at,
  });
}
