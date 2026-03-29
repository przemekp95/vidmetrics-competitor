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
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(4,8,20,0.62)] backdrop-blur-[6px]">
      <div aria-hidden="true" className="absolute inset-0" onClick={onClose} />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-checkout-title"
        aria-describedby={errorId ? `${dialogDescriptionId} ${errorId}` : dialogDescriptionId}
        className="relative flex h-full w-full max-w-[560px] flex-col overflow-y-auto border-l border-[rgba(86,250,255,0.24)] bg-[linear-gradient(180deg,rgba(8,15,31,0.98),rgba(4,8,20,0.98))] p-6 shadow-[-28px_0_80px_rgba(0,0,0,0.45)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">B2B billing</p>
            <h2
              id="upgrade-checkout-title"
              className="mt-4 text-3xl font-semibold tracking-tight neon-title"
            >
              Stripe sandbox subscription
            </h2>
            <p
              id={dialogDescriptionId}
              className="mt-3 text-sm leading-6 neon-muted-copy"
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
            className="neon-button-outline rounded-full p-2 text-(--color-muted)"
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
                  ? "neon-badge"
                  : "border border-[rgba(112,132,191,0.18)] bg-[rgba(8,15,31,0.72)] text-(--color-muted)"
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
            className="neon-alert-error mt-5 rounded-2xl px-4 py-3 text-sm"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="neon-shell-soft mt-5 rounded-[28px] p-5">
          <p className="eyebrow">Account status</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight neon-title">
            {currentStatus.label}
          </p>
          <p className="mt-2 text-sm leading-6 neon-muted-copy">
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
          <Link href="/terms" className="neon-link font-semibold text-(--color-foreground)">
            Terms
          </Link>
          ,{" "}
          <Link href="/privacy" className="neon-link font-semibold text-(--color-foreground)">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/accessibility" className="neon-link font-semibold text-(--color-foreground)">
            Accessibility
          </Link>
          ,{" "}
          <Link href="/copyright" className="neon-link font-semibold text-(--color-foreground)">
            Copyright
          </Link>
          , and{" "}
          <Link href="/legal" className="neon-link font-semibold text-(--color-foreground)">
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
                      ? "border-(--color-accent) bg-[rgba(86,250,255,0.12)]"
                      : "border-(--border-interactive) bg-[rgba(8,15,31,0.72)] hover:border-(--color-accent)"
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
                    <span className="neon-chip rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
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
              className="neon-button mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
            >
              Continue to configuration
            </button>
          </div>
        ) : null}

        {step === "config" ? (
          <div className="mt-6 grid gap-5">
            <section className="neon-shell-soft rounded-[28px] p-5">
              <p className="eyebrow">Plan</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight neon-title">
                {selectedPlan.label}
              </h3>
              <p className="mt-2 text-sm leading-6 neon-muted-copy">
                {planDescriptions[planId]}
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-[24px] border p-4 text-left transition ${
                  billingCycle === "monthly"
                    ? "border-(--color-accent) bg-[rgba(86,250,255,0.12)]"
                    : "border-(--border-interactive) bg-[rgba(8,15,31,0.72)]"
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
                    ? "border-(--color-accent) bg-[rgba(86,250,255,0.12)]"
                    : "border-(--border-interactive) bg-[rgba(8,15,31,0.72)]"
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
                className="neon-field h-12 rounded-2xl px-4 text-sm"
              />
              <span className="text-xs text-(--color-muted)">
                {`${selectedPlan.minSeats}-${selectedPlan.maxSeats} seats supported on this plan.`}
              </span>
            </label>

            <div className="neon-shell-soft rounded-[28px] p-5">
              <p className="eyebrow">What happens next</p>
              <ul className="mt-3 grid gap-2 text-sm leading-6 neon-muted-copy">
                <li>1. You will be redirected to Stripe-hosted Checkout in sandbox mode.</li>
                <li>2. Checkout return alone does not unlock access.</li>
                <li>3. Paid workflows activate only after webhook-confirmed billing state.</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("plan")}
                className="neon-button-outline inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => void handleStartCheckout()}
                disabled={isStarting || !Number.isInteger(selectedSeats)}
                className="neon-button inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="neon-shell-soft mt-6 rounded-[28px] p-6">
            <div className="inline-flex rounded-full border border-[rgba(86,250,255,0.16)] bg-[rgba(8,15,31,0.84)] p-3 text-(--color-accent)">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
              Paid workflows unlocked
            </h3>
            <p className="mt-3 text-sm leading-6 neon-muted-copy">
              Durable reports, weekly tracking, and benchmarks are available for this account.
            </p>
          </div>
        ) : checkout?.status === "pending_payment" ? (
          <div className="neon-shell-soft mt-6 rounded-[28px] p-6">
            <div className="inline-flex rounded-full border border-[rgba(86,250,255,0.16)] bg-[rgba(8,15,31,0.84)] p-3 text-(--color-accent)">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
              Waiting for Stripe webhook
            </h3>
            <p className="mt-3 text-sm leading-6 neon-muted-copy">
              Checkout completed, but the workspace will remain locked until Stripe confirms the
              subscription payment.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
