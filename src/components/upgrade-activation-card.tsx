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
        "border-[rgba(16,120,105,0.2)] bg-[linear-gradient(135deg,rgba(16,120,105,0.14),rgba(255,255,255,0.94))]",
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
        "border-[rgba(211,141,28,0.24)] bg-[linear-gradient(135deg,rgba(255,246,219,0.94),rgba(255,255,255,0.94))]",
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
        "border-[rgba(191,87,70,0.22)] bg-[linear-gradient(135deg,rgba(255,240,235,0.92),rgba(255,255,255,0.94))]",
    };
  }

  return {
    badge: "B2B MVP",
    title: "Turn this analyzer into a paid workspace.",
    description:
      "Use Stripe sandbox checkout to activate durable reports, weekly tracking, and benchmarks for the signed-in account.",
    icon: <Sparkles className="h-4 w-4" />,
    theme: "border-(--color-border) bg-white/90",
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
      className={`rounded-[32px] border p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)] ${statusTone.theme}`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Billing
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
              {statusTone.title}
            </h2>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
              {statusTone.icon}
              {statusTone.badge}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-muted)]">
            {statusTone.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--border-interactive) bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          <CreditCard className="h-4 w-4" />
          {checkout?.status === "active" ? "Manage billing state" : "Open checkout"}
        </button>
      </div>

      <dl className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[24px] border border-(--color-border) bg-white/75 p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Plan</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.planLabel ?? "Explorer"}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            {checkout?.displayPrice ?? "No Stripe checkout started yet"}
          </p>
        </div>
        <div className="rounded-[24px] border border-(--color-border) bg-white/75 p-4">
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
        <div className="rounded-[24px] border border-(--color-border) bg-white/75 p-4">
          <dt className="text-sm text-[color:var(--color-muted)]">Checkout completed</dt>
          <dd className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
            {checkout?.checkoutCompletedAt ? formatDateTime(checkout.checkoutCompletedAt) : "Not yet"}
          </dd>
          <p className="mt-1 text-sm text-[color:var(--color-muted)]">
            Hosted checkout does not unlock access by itself.
          </p>
        </div>
        <div className="rounded-[24px] border border-(--color-border) bg-white/75 p-4">
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
