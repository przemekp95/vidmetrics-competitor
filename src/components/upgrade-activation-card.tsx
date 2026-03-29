import { BadgeCheck, CreditCard, AlertTriangle, Sparkles } from "lucide-react";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { formatDateTime } from "@/lib/formatters";

function getStatusTone(status: UpgradeCheckoutReadModel["status"] | null | undefined) {
  if (status === "active") {
    return {
      badge: "Active",
      title: "Paid workflows are active.",
      description:
        "Stripe sandbox checkout and webhook confirmation succeeded. Durable reports, tracking, and benchmarks are now available.",
      icon: <BadgeCheck className="h-4 w-4" />,
      theme:
        "from-[rgba(54,255,201,0.18)] via-[rgba(86,250,255,0.12)] to-transparent",
    };
  }

  if (status === "pending_payment" || status === "checkout_pending") {
    return {
      badge: "Pending",
      title: "Billing activation is still in progress.",
      description:
        "Checkout may have started or completed, but paid workflows stay locked until the Stripe webhook confirms subscription billing.",
      icon: <CreditCard className="h-4 w-4" />,
      theme:
        "from-[rgba(255,99,216,0.12)] via-[rgba(140,99,255,0.12)] to-transparent",
    };
  }

  if (status === "past_due" || status === "canceled") {
    return {
      badge: "Needs attention",
      title: status === "past_due" ? "Billing is past due." : "Subscription is canceled.",
      description:
        "Paid workflows are locked until a new successful Stripe billing cycle reactivates the account.",
      icon: <AlertTriangle className="h-4 w-4" />,
      theme:
        "from-[rgba(255,107,147,0.16)] via-[rgba(140,99,255,0.1)] to-transparent",
    };
  }

  return {
    badge: "B2B MVP",
    title: "Turn this analyzer into a paid workspace.",
    description:
      "Use Stripe sandbox checkout to activate durable reports, weekly tracking, and benchmarks for the signed-in account.",
    icon: <Sparkles className="h-4 w-4" />,
    theme: "from-[rgba(86,250,255,0.12)] via-transparent to-transparent",
  };
}

export function UpgradeActivationCard({
  checkout,
  onOpenCheckout,
}: {
  checkout: UpgradeCheckoutReadModel | null;
  onOpenCheckout: () => void;
}) {
  const statusTone = getStatusTone(checkout?.status);

  return (
    <section
      id="billing"
      className="neon-panel relative overflow-hidden rounded-[32px] p-6"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${statusTone.theme}`} />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="relative max-w-3xl">
          <p className="eyebrow">Billing</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight neon-title">
              {statusTone.title}
            </h2>
            <span className="neon-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
              {statusTone.icon}
              {statusTone.badge}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
            {statusTone.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="neon-button-outline relative inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
        >
          <CreditCard className="h-4 w-4" />
          {checkout?.status === "active" ? "Manage billing state" : "Open checkout"}
        </button>
      </div>

      <dl className="relative mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="neon-shell-soft rounded-[24px] p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Plan</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.planLabel ?? "Explorer"}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            {checkout?.displayPrice ?? "No Stripe checkout started yet"}
          </p>
        </div>
        <div className="neon-shell-soft rounded-[24px] p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Entitlements</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.entitlements.length ?? 0}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            {checkout?.entitlements.length
              ? checkout.entitlements.join(", ").replaceAll("_", " ")
              : "Paid workflows locked"}
          </p>
        </div>
        <div className="neon-shell-soft rounded-[24px] p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Checkout completed</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.checkoutCompletedAt ? formatDateTime(checkout.checkoutCompletedAt) : "Not yet"}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Hosted checkout does not unlock access by itself.
          </p>
        </div>
        <div className="neon-shell-soft rounded-[24px] p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Last paid</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.lastPaidAt ? formatDateTime(checkout.lastPaidAt) : "Awaiting payment"}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Stripe subscription state is the source of truth.
          </p>
        </div>
      </dl>
    </section>
  );
}
