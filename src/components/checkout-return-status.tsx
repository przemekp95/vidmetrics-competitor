"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { readApiResponse } from "@/lib/read-api-response";

export function CheckoutReturnStatus() {
  const searchParams = useSearchParams();
  const [checkout, setCheckout] = useState<UpgradeCheckoutReadModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isCanceled = searchParams.get("canceled") === "1";
  const sessionId = searchParams.get("session_id");
  const endpoint = sessionId
    ? `/api/checkout-return-state?session_id=${encodeURIComponent(sessionId)}`
    : "/api/upgrade-checkout";

  useEffect(() => {
    let isActive = true;

    async function loadCheckoutState() {
      try {
        const response = await fetch(endpoint, {
          method: "GET",
        });
        const payload = await readApiResponse<{
          checkout: UpgradeCheckoutReadModel | null;
        }>(response, {
          errorMessage: "Unable to load checkout state.",
          unexpectedResponseMessage:
            "Billing state is temporarily unavailable. Refresh and try again.",
        });

        if (isActive) {
          setCheckout(payload.checkout);
          setErrorMessage(null);
        }
      } catch (error) {
        if (isActive) {
          setErrorMessage(
            error instanceof Error ? error.message : "Unable to load checkout state right now.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadCheckoutState();

    if (!sessionId || isCanceled) {
      return () => {
        isActive = false;
      };
    }

    const interval = window.setInterval(() => {
      void loadCheckoutState();
    }, 3000);

    return () => {
      isActive = false;
      window.clearInterval(interval);
    };
  }, [endpoint, isCanceled, sessionId]);

  return (
    <section className="neon-panel neon-grid rounded-[34px] p-6">
      <p className="eyebrow">Checkout return</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
        {isCanceled
          ? "Checkout was canceled."
          : checkout?.status === "active"
            ? "Paid workflows are active."
            : "Waiting for Stripe billing confirmation."}
      </h1>
      <p className="mt-4 text-sm leading-6 neon-muted-copy">
        {isCanceled
          ? "No features were unlocked. You can return to the workspace and start a new Stripe sandbox checkout."
          : sessionId
            ? "Returning from hosted Checkout does not unlock access by itself. This page tracks the Stripe session until the webhook confirms the subscription state."
            : "Returning from hosted Checkout does not unlock access by itself. The workspace updates only after the Stripe webhook confirms the subscription state."}
      </p>

      {isLoading ? (
        <p className="mt-4 text-sm neon-muted-copy">Loading billing state...</p>
      ) : null}

      {errorMessage ? (
        <div
          role="alert"
          className="neon-alert-error mt-4 rounded-2xl px-4 py-3 text-sm"
        >
          {errorMessage}
        </div>
      ) : null}

      {checkout ? (
        <dl className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="neon-shell-soft rounded-3xl p-4">
            <dt className="text-sm text-(--color-muted)">Status</dt>
            <dd className="mt-2 text-lg font-semibold text-(--color-foreground)">
              {checkout.status}
            </dd>
          </div>
          <div className="neon-shell-soft rounded-3xl p-4">
            <dt className="text-sm text-(--color-muted)">Plan</dt>
            <dd className="mt-2 text-lg font-semibold text-(--color-foreground)">
              {checkout.planLabel ?? "Not started"}
            </dd>
          </div>
          <div className="neon-shell-soft rounded-3xl p-4">
            <dt className="text-sm text-(--color-muted)">Entitlements</dt>
            <dd className="mt-2 text-lg font-semibold text-(--color-foreground)">
              {checkout.entitlements.length}
            </dd>
          </div>
        </dl>
      ) : null}

      <div className="mt-6">
        <Link
          href="/"
          className="neon-button-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
        >
          Back to workspace
        </Link>
      </div>
    </section>
  );
}
