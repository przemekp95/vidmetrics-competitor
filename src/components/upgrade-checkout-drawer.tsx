"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck, Sparkles, X } from "lucide-react";
import Link from "next/link";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { commercialUpgradeCatalog } from "@/infrastructure/commercial-upgrade/static-upgrade-catalog-provider";

type DrawerStep = "plan" | "config";
type PlanId = "team" | "enterprise";
type BillingCycle = "monthly" | "annual";

const planDescriptions: Record<PlanId, string> = {
  team: "For analyst teams that need saved reports and weekly tracking inside a signed-in workspace.",
  enterprise:
    "For media organizations that need seats, benchmarks, procurement-safe packaging, and billing governance.",
};

const statusContent = {
  draft: {
    label: "Draft",
    description: "Choose a plan and continue to Stripe sandbox checkout when you are ready.",
  },
  checkout_pending: {
    label: "Checkout pending",
    description: "A Stripe checkout session has been created but payment is not yet confirmed.",
  },
  pending_payment: {
    label: "Webhook pending",
    description: "Checkout completed. Waiting for subscription billing confirmation from Stripe.",
  },
  active: {
    label: "Active",
    description: "Paid workflows are unlocked for this account.",
  },
  past_due: {
    label: "Past due",
    description: "Billing needs attention before paid workflows can be used again.",
  },
  canceled: {
    label: "Canceled",
    description: "This subscription is no longer active. Start a new checkout to restore access.",
  },
} as const;

function getFocusableElements(container: HTMLElement) {
  return [...container.querySelectorAll<HTMLElement>(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )].filter((element) => !element.hasAttribute("hidden") && !element.getAttribute("aria-hidden"));
}

function getInitialDrawerState(checkout: UpgradeCheckoutReadModel | null) {
  return {
    step: "plan" as const,
    planId: checkout?.planId ?? ("team" as const),
    billingCycle: checkout?.billingCycle ?? ("monthly" as const),
    seats: String(checkout?.seats ?? 5),
  };
}

export function UpgradeCheckoutDrawer({
  isOpen,
  checkout,
  isStarting,
  errorMessage,
  onClose,
  onStartCheckout,
}: {
  isOpen: boolean;
  checkout: UpgradeCheckoutReadModel | null;
  isStarting: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onStartCheckout: (input: {
    planId: PlanId;
    billingCycle: BillingCycle;
    seats: number;
  }) => Promise<void>;
}) {
  const initialState = useMemo(() => getInitialDrawerState(checkout), [checkout]);
  const [step, setStep] = useState<DrawerStep>(() => initialState.step);
  const [planId, setPlanId] = useState<PlanId>(() => initialState.planId);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(() => initialState.billingCycle);
  const [seats, setSeats] = useState(() => initialState.seats);
  const dialogRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    previouslyFocusedElementRef.current = document.activeElement as HTMLElement | null;
    window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;

      if (!dialog) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements(dialog);

      if (focusableElements.length === 0) {
        return;
      }

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      } else if (!event.shiftKey && document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedElementRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const selectedPlan =
    commercialUpgradeCatalog.find((plan) => plan.planId === planId) ?? commercialUpgradeCatalog[0];
  const selectedSeats = Number(seats);
  const currentStatus = checkout ? statusContent[checkout.status] : statusContent.draft;
  const dialogDescriptionId = "upgrade-checkout-description";
  const errorId = errorMessage ? "upgrade-checkout-error" : null;

  async function handleStartCheckout() {
    await onStartCheckout({
      planId,
      billingCycle,
      seats: selectedSeats,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(31,35,33,0.34)] backdrop-blur-[1px]">
      <div aria-hidden="true" className="absolute inset-0" onClick={onClose} />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-checkout-title"
        aria-describedby={errorId ? `${dialogDescriptionId} ${errorId}` : dialogDescriptionId}
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-(--border-interactive) bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,250,242,0.98))] p-6 shadow-[-28px_0_80px_rgba(31,35,33,0.18)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
              B2B billing
            </p>
            <h2
              id="upgrade-checkout-title"
              className="mt-2 text-3xl font-semibold tracking-tight text-(--color-foreground)"
            >
              Stripe sandbox subscription
            </h2>
            <p
              id={dialogDescriptionId}
              className="mt-2 text-sm leading-6 text-(--color-muted)"
            >
              Choose the plan and seat configuration for this signed-in workspace. Checkout runs
              through Stripe sandbox, and paid workflows unlock only after webhook-confirmed
              billing activation.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close upgrade checkout drawer"
            onClick={onClose}
            className="rounded-full border border-(--border-interactive) bg-white p-2 text-(--color-muted) transition hover:text-(--color-foreground)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            { key: "plan", label: "Plan" },
            { key: "config", label: "Config" },
          ].map((item, index) => (
            <div
              key={item.key}
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                step === item.key
                  ? "bg-[rgba(16,120,105,0.12)] text-(--color-accent)"
                  : "bg-[rgba(31,35,33,0.08)] text-(--color-muted)"
              }`}
            >
              {index + 1}. {item.label}
            </div>
          ))}
        </div>

        {errorMessage ? (
          <div
            id={errorId ?? undefined}
            role="alert"
            className="mt-5 rounded-2xl border border-[rgba(191,87,70,0.28)] bg-[rgba(255,240,235,0.85)] px-4 py-3 text-sm text-(--color-danger)"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-5 rounded-[28px] border border-[rgba(16,120,105,0.2)] bg-[rgba(232,247,243,0.85)] p-5">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--color-accent)">
            Account status
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground)">
            {currentStatus.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-(--color-muted)">
            {currentStatus.description}
          </p>
          {checkout?.displayPrice ? (
            <p className="mt-3 text-sm font-medium text-(--color-foreground)">
              Current selection: {checkout.displayPrice}
            </p>
          ) : null}
        </div>

        <p className="mt-5 text-xs leading-6 text-(--color-muted)">
          Review the{" "}
          <Link
            href="/terms"
            className="font-semibold text-(--color-foreground) underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:text-(--color-accent)"
          >
            Terms
          </Link>
          ,{" "}
          <Link
            href="/privacy"
            className="font-semibold text-(--color-foreground) underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:text-(--color-accent)"
          >
            Privacy Policy
          </Link>
          ,{" "}
          <Link
            href="/accessibility"
            className="font-semibold text-(--color-foreground) underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:text-(--color-accent)"
          >
            Accessibility
          </Link>
          ,{" "}
          <Link
            href="/copyright"
            className="font-semibold text-(--color-foreground) underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:text-(--color-accent)"
          >
            Copyright
          </Link>
          , and{" "}
          <Link
            href="/legal"
            className="font-semibold text-(--color-foreground) underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:text-(--color-accent)"
          >
            Legal Notice
          </Link>
          . This flow is B2B-only and intended for Stripe sandbox MVP review.
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
                    setSeats(String(plan.minSeats));
                  }}
                  className={`rounded-[28px] border p-5 text-left transition ${
                    selected
                      ? "border-(--color-accent) bg-[rgba(16,120,105,0.08)]"
                      : "border-(--border-interactive) bg-white/80 hover:border-(--color-accent)"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
                        {plan.label}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                        {planDescriptions[plan.planId]}
                      </p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                      {plan.minSeats}-{plan.maxSeats} seats
                    </span>
                  </div>

                  <div className="mt-5 grid gap-2 text-sm text-(--color-foreground-soft)">
                    <p>{`$${plan.monthlyPricePerSeat}/seat monthly`}</p>
                    <p>{`$${plan.annualPricePerSeat}/seat monthly billed annually`}</p>
                  </div>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setStep("config")}
              className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-(--color-foreground) px-5 text-sm font-semibold text-(--color-background) transition hover:bg-(--color-accent)"
            >
              Continue to configuration
            </button>
          </div>
        ) : null}

        {step === "config" ? (
          <div className="mt-6 grid gap-5">
            <section className="rounded-[28px] border border-(--color-border) bg-white/80 p-5">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
                Plan
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground)">
                {selectedPlan.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-(--color-muted)">
                {planDescriptions[planId]}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-[24px] border p-4 text-left transition ${
                  billingCycle === "monthly"
                    ? "border-(--color-accent) bg-[rgba(16,120,105,0.08)]"
                    : "border-(--border-interactive) bg-white/80"
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--color-muted)">
                  Monthly
                </p>
                <p className="mt-2 text-lg font-semibold text-(--color-foreground)">
                  {`$${selectedPlan.monthlyPricePerSeat}/seat`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle("annual")}
                className={`rounded-[24px] border p-4 text-left transition ${
                  billingCycle === "annual"
                    ? "border-(--color-accent) bg-[rgba(16,120,105,0.08)]"
                    : "border-(--border-interactive) bg-white/80"
                }`}
              >
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--color-muted)">
                  Annual
                </p>
                <p className="mt-2 text-lg font-semibold text-(--color-foreground)">
                  {`$${selectedPlan.annualPricePerSeat}/seat/mo`}
                </p>
              </button>
            </section>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-(--color-muted)">Seats</span>
              <input
                value={seats}
                onChange={(event) => setSeats(event.target.value)}
                inputMode="numeric"
                className="h-12 rounded-2xl border border-(--border-interactive) bg-white/90 px-4 text-sm text-(--color-foreground) outline-none transition focus:border-(--color-accent) focus:ring-4 focus:ring-[rgba(16,120,105,0.12)]"
              />
              <span className="text-xs text-(--color-muted)">
                {`${selectedPlan.minSeats}-${selectedPlan.maxSeats} seats supported on this plan.`}
              </span>
            </label>

            <div className="rounded-[28px] border border-(--color-border) bg-[rgba(255,252,246,0.78)] p-5">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-(--color-muted)">
                What happens next
              </p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-(--color-muted)">
                <li>1. You will be redirected to Stripe-hosted Checkout in sandbox mode.</li>
                <li>2. Checkout return alone does not unlock access.</li>
                <li>3. Paid workflows activate only after webhook-confirmed billing state.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-(--border-interactive) bg-white px-5 text-sm font-semibold text-(--color-foreground)"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleStartCheckout()}
                disabled={isStarting || !Number.isInteger(selectedSeats)}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-(--color-foreground) px-5 text-sm font-semibold text-(--color-background) transition hover:bg-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Opening Stripe
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Continue to Stripe sandbox
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {checkout?.status === "active" ? (
          <div className="mt-6 rounded-[28px] border border-[rgba(16,120,105,0.2)] bg-[linear-gradient(135deg,rgba(16,120,105,0.1),rgba(255,255,255,0.92))] p-6">
            <div className="inline-flex rounded-full bg-white/80 p-3 text-(--color-accent)">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-foreground)">
              Paid workflows unlocked
            </h3>
            <p className="mt-3 text-sm leading-6 text-(--color-muted)">
              Durable reports, weekly tracking, and benchmarks are available for this account.
            </p>
          </div>
        ) : checkout?.status === "pending_payment" ? (
          <div className="mt-6 rounded-[28px] border border-[rgba(16,120,105,0.2)] bg-[linear-gradient(135deg,rgba(16,120,105,0.1),rgba(255,255,255,0.92))] p-6">
            <div className="inline-flex rounded-full bg-white/80 p-3 text-(--color-accent)">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight text-(--color-foreground)">
              Waiting for Stripe webhook
            </h3>
            <p className="mt-3 text-sm leading-6 text-(--color-muted)">
              Checkout completed, but the workspace will remain locked until Stripe confirms the
              subscription payment.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
