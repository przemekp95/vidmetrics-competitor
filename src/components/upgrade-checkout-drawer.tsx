"use client";

import { LoaderCircle, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { commercialUpgradeCatalog } from "@/infrastructure/commercial-upgrade/static-upgrade-catalog-provider";

type DrawerStep = "plan" | "config" | "details" | "success";
type PlanId = "team" | "enterprise";
type BillingCycle = "monthly" | "annual";

const planDescriptions: Record<PlanId, string> = {
  team: "For agency teams that want weekly tracking and saved report workflows.",
  enterprise:
    "For media organizations that need seats, benchmarks, procurement-safe packaging, and activation workflows.",
};

function getInitialDrawerState(checkout: UpgradeCheckoutReadModel | null) {
  if (checkout?.status === "submitted") {
    return {
      step: "success" as const,
      planId: checkout.planId,
      billingCycle: checkout.billingCycle,
      seats: checkout.seats.toString(),
      buyerName: checkout.buyerName ?? "",
      buyerEmail: checkout.buyerEmail ?? "",
      companyName: checkout.companyName ?? "",
    };
  }

  if (checkout?.status === "draft") {
    return {
      step: "details" as const,
      planId: checkout.planId,
      billingCycle: checkout.billingCycle,
      seats: checkout.seats.toString(),
      buyerName: "",
      buyerEmail: "",
      companyName: "",
    };
  }

  return {
    step: "plan" as const,
    planId: "team" as const,
    billingCycle: "monthly" as const,
    seats: "5",
    buyerName: "",
    buyerEmail: "",
    companyName: "",
  };
}

export function UpgradeCheckoutDrawer({
  isOpen,
  checkout,
  isStarting,
  isConfirming,
  errorMessage,
  onClose,
  onStartCheckout,
  onConfirmCheckout,
}: {
  isOpen: boolean;
  checkout: UpgradeCheckoutReadModel | null;
  isStarting: boolean;
  isConfirming: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onStartCheckout: (input: {
    planId: PlanId;
    billingCycle: BillingCycle;
    seats: number;
  }) => Promise<void>;
  onConfirmCheckout: (input: {
    buyerName: string;
    buyerEmail: string;
    companyName: string;
  }) => Promise<void>;
}) {
  const initialState = getInitialDrawerState(checkout);
  const [step, setStep] = useState<DrawerStep>(initialState.step);
  const [planId, setPlanId] = useState<PlanId>(initialState.planId);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(initialState.billingCycle);
  const [seats, setSeats] = useState(initialState.seats);
  const [buyerName, setBuyerName] = useState(initialState.buyerName);
  const [buyerEmail, setBuyerEmail] = useState(initialState.buyerEmail);
  const [companyName, setCompanyName] = useState(initialState.companyName);

  const selectedPlan = useMemo(
    () =>
      commercialUpgradeCatalog.find((plan) => plan.planId === planId) ??
      commercialUpgradeCatalog[0],
    [planId],
  );

  if (!isOpen) {
    return null;
  }

  const selectedSeats = Number(seats);

  async function handleStart() {
    try {
      await onStartCheckout({
        planId,
        billingCycle,
        seats: selectedSeats,
      });

      setStep("details");
    } catch {}
  }

  async function handleConfirm() {
    try {
      await onConfirmCheckout({
        buyerName,
        buyerEmail,
        companyName,
      });

      setStep("success");
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(31,35,33,0.34)] backdrop-blur-[1px]">
      <button
        type="button"
        aria-label="Close pricing drawer"
        onClick={onClose}
        className="absolute inset-0"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-checkout-title"
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-[color:var(--color-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,242,0.98))] p-6 shadow-[-28px_0_80px_rgba(31,35,33,0.18)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
              Workspace checkout
            </p>
            <h2
              id="upgrade-checkout-title"
              className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]"
            >
              Upgrade VidMetrics
            </h2>
            <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
              Checkout is mocked for demo purposes. No real billing or provisioning will run.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[color:var(--color-border)] bg-white p-2 text-[color:var(--color-muted)] transition hover:text-[color:var(--color-foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "plan", label: "Plan" },
            { key: "config", label: "Config" },
            { key: "details", label: "Buyer" },
          ].map((item, index) => (
            <div
              key={item.key}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                step === item.key || (step === "success" && item.key === "details")
                  ? "bg-[rgba(16,120,105,0.12)] text-[color:var(--color-accent)]"
                  : "bg-[rgba(31,35,33,0.08)] text-[color:var(--color-muted)]"
              }`}
            >
              {index + 1}. {item.label}
            </div>
          ))}
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-[rgba(191,87,70,0.2)] bg-[rgba(255,240,235,0.85)] px-4 py-3 text-sm text-[color:var(--color-danger)]">
            {errorMessage}
          </div>
        ) : null}

        <p className="mt-5 text-xs leading-6 text-[color:var(--color-muted)]">
          Review the{" "}
          <Link href="/terms" className="font-semibold text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]">
            Terms
          </Link>
          ,{" "}
          <Link href="/privacy" className="font-semibold text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/copyright" className="font-semibold text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]">
            Copyright
          </Link>
          , and{" "}
          <Link href="/legal" className="font-semibold text-[color:var(--color-foreground)] transition hover:text-[color:var(--color-accent)]">
            Legal Notice
          </Link>
          . This checkout remains a demo activation flow only.
        </p>

        {step === "plan" ? (
          <div className="mt-6 grid gap-4">
            {commercialUpgradeCatalog.map((plan) => {
              const selected = plan.planId === planId;

              return (
                <button
                  key={plan.planId}
                  type="button"
                  onClick={() => {
                    setPlanId(plan.planId);
                    setSeats(plan.minSeats.toString());
                  }}
                  className={`rounded-[28px] border p-5 text-left transition ${
                    selected
                      ? "border-[color:var(--color-accent)] bg-[rgba(16,120,105,0.08)]"
                      : "border-[color:var(--color-border)] bg-white/80 hover:border-[color:var(--color-accent)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                        {plan.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                        {planDescriptions[plan.planId]}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                      {plan.minSeats}-{plan.maxSeats} seats
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-[color:var(--color-foreground-soft)]">
                    <p>{`$${plan.monthlyPricePerSeat}/seat monthly`}</p>
                    <p>{`$${plan.annualPricePerSeat}/seat monthly billed annually`}</p>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setStep("config")}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)]"
            >
              Continue to configuration
            </button>
          </div>
        ) : null}

        {step === "config" ? (
          <div className="mt-6 grid gap-5">
            <section className="rounded-[28px] border border-[color:var(--color-border)] bg-white/80 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                Plan
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                {selectedPlan.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
                {planDescriptions[planId]}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-[24px] border p-4 text-left transition ${
                  billingCycle === "monthly"
                    ? "border-[color:var(--color-accent)] bg-[rgba(16,120,105,0.08)]"
                    : "border-[color:var(--color-border)] bg-white/80"
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                  Monthly
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                  {`$${selectedPlan.monthlyPricePerSeat}/seat`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-[24px] border p-4 text-left transition ${
                  billingCycle === "annual"
                    ? "border-[color:var(--color-accent)] bg-[rgba(16,120,105,0.08)]"
                    : "border-[color:var(--color-border)] bg-white/80"
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
                  Annual
                </p>
                <p className="mt-2 text-lg font-semibold text-[color:var(--color-foreground)]">
                  {`$${selectedPlan.annualPricePerSeat}/seat/mo`}
                </p>
              </button>
            </section>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-[color:var(--color-muted)]">Seats</span>
              <input
                value={seats}
                onChange={(event) => setSeats(event.target.value)}
                inputMode="numeric"
                className="h-12 rounded-2xl border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
              />
              <span className="text-xs text-[color:var(--color-muted)]">
                {`${selectedPlan.minSeats}-${selectedPlan.maxSeats} seats supported on this plan.`}
              </span>
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleStart}
                disabled={isStarting || !Number.isInteger(selectedSeats)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Pricing
                  </>
                ) : (
                  "Continue to checkout"
                )}
              </button>
            </div>
          </div>
        ) : null}

        {step === "details" ? (
          <div className="mt-6 grid gap-5">
            <section className="rounded-[28px] border border-[color:var(--color-border)] bg-white/80 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
                Order summary
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
                {checkout?.planLabel ?? selectedPlan.label}
              </h3>
              <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                {checkout?.displayPrice ?? "Price will update after configuration"}
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[color:var(--color-foreground-soft)]">
                {(checkout?.includedFeatures ?? selectedPlan.includedFeatures).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>

            <div className="grid gap-3">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-[color:var(--color-muted)]">Buyer name</span>
                <input
                  value={buyerName}
                  onChange={(event) => setBuyerName(event.target.value)}
                  className="h-12 rounded-2xl border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[color:var(--color-muted)]">Buyer email</span>
                <input
                  value={buyerEmail}
                  onChange={(event) => setBuyerEmail(event.target.value)}
                  className="h-12 rounded-2xl border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-[color:var(--color-muted)]">Company</span>
                <input
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  className="h-12 rounded-2xl border border-[color:var(--color-border)] bg-white/90 px-4 text-sm text-[color:var(--color-foreground)] outline-none transition focus:border-[color:var(--color-accent)] focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
                />
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("config")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)]"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isConfirming}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isConfirming ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Submitting order
                  </>
                ) : (
                  "Submit checkout"
                )}
              </button>
            </div>
          </div>
        ) : null}

        {step === "success" ? (
          <div className="mt-6 rounded-[28px] border border-[rgba(16,120,105,0.2)] bg-[linear-gradient(135deg,rgba(16,120,105,0.1),rgba(255,255,255,0.92))] p-6">
            <div className="inline-flex rounded-full bg-white/80 p-3 text-[color:var(--color-accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
              Checkout submitted
            </h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
              The workspace now shows a pending activation state and a mock order summary for
              enterprise review.
            </p>

            <dl className="mt-6 grid gap-3 text-sm">
              <div className="rounded-[22px] border border-[color:var(--color-border)] bg-white/75 p-4">
                <dt className="text-[color:var(--color-muted)]">Plan</dt>
                <dd className="mt-1 font-semibold text-[color:var(--color-foreground)]">
                  {checkout?.planLabel}
                </dd>
              </div>
              <div className="rounded-[22px] border border-[color:var(--color-border)] bg-white/75 p-4">
                <dt className="text-[color:var(--color-muted)]">Order code</dt>
                <dd className="mt-1 font-semibold text-[color:var(--color-foreground)]">
                  {checkout?.confirmationCode}
                </dd>
              </div>
              <div className="rounded-[22px] border border-[color:var(--color-border)] bg-white/75 p-4">
                <dt className="text-[color:var(--color-muted)]">Billing</dt>
                <dd className="mt-1 font-semibold text-[color:var(--color-foreground)]">
                  {checkout?.displayPrice}
                </dd>
              </div>
            </dl>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[color:var(--color-border)] bg-white px-5 text-sm font-semibold text-[color:var(--color-foreground)]"
              >
                Start another quote
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)]"
              >
                Back to workspace
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
