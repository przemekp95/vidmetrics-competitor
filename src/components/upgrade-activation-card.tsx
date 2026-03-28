import { BadgeCheck, CreditCard, Sparkles } from "lucide-react";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { formatDateTime } from "@/lib/formatters";

export function UpgradeActivationCard({
  checkout,
  onOpenCheckout,
}: {
  checkout: UpgradeCheckoutReadModel | null;
  onOpenCheckout: () => void;
}) {
  if (checkout?.status === "submitted") {
    return (
      <section
        id="billing"
        className="rounded-[32px] border border-[color:var(--color-border)] bg-[linear-gradient(135deg,rgba(16,120,105,0.14),rgba(255,255,255,0.94))] p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Billing
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Pending activation
              </h2>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                <BadgeCheck className="h-3.5 w-3.5" />
                Mock checkout submitted
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-muted)]">
              The checkout flow is complete and the workspace now reads like an enterprise SaaS
              account waiting on provisioning. No real billing or seat activation occurs in this
              MVP.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
          >
            <CreditCard className="h-4 w-4" />
            View order
          </button>
        </div>

        <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-[color:var(--color-border)] bg-white/75 p-4">
            <dt className="text-sm text-[color:var(--color-muted)]">Plan</dt>
            <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
              {checkout.planLabel}
            </dd>
            <p className="mt-1 text-sm text-[color:var(--color-muted)]">
              {checkout.seats} seats &bull; {checkout.displayPrice}
            </p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--color-border)] bg-white/75 p-4">
            <dt className="text-sm text-[color:var(--color-muted)]">Buyer</dt>
            <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
              {checkout.buyerName}
            </dd>
            <p className="mt-1 text-sm text-[color:var(--color-muted)]">{checkout.buyerEmail}</p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--color-border)] bg-white/75 p-4">
            <dt className="text-sm text-[color:var(--color-muted)]">Company</dt>
            <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
              {checkout.companyName}
            </dd>
            <p className="mt-1 text-sm text-[color:var(--color-muted)]">
              Submitted {checkout.submittedAt ? formatDateTime(checkout.submittedAt) : "now"}
            </p>
          </div>
          <div className="rounded-[24px] border border-[color:var(--color-border)] bg-white/75 p-4">
            <dt className="text-sm text-[color:var(--color-muted)]">Order code</dt>
            <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
              {checkout.confirmationCode}
            </dd>
            <p className="mt-1 text-sm text-[color:var(--color-muted)]">Activation pending</p>
          </div>
        </dl>
      </section>
    );
  }

  return (
    <section
      id="billing"
      className="rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]"
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Billing
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Turn this analyzer into a client-facing workspace.
          </h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
            Add plan selection, seats, and a checkout-style activation flow so the demo reads like
            a real commercial product instead of a one-off internal tool.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)]"
        >
          <Sparkles className="h-4 w-4" />
          Open checkout
        </button>
      </div>
    </section>
  );
}
