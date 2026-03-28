import { z } from "zod";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import type { BillingWebhookVerifier } from "@/ports/billing-checkout-gateway";
import { isApplicationError } from "@/shared/application-error";

const startCheckoutSchema = z.object({
  planId: z.enum(["team", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
  seats: z.number().int().min(1).max(250),
});
const checkoutSessionIdSchema = z.string().trim().min(1).max(255);

type AuthenticatedRequestContext = {
  userId: string;
  email: string;
  name: string | null;
};

function createErrorResponse(status: number, code: string, message: string) {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    },
    { status },
  );
}

function hasTrustedOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return false;
  }

  return origin === new URL(request.url).origin;
}

export function createGetUpgradeCheckoutRouteHandler({
  getCheckoutState,
  getAuthenticatedUser,
}: {
  getCheckoutState: (input: { userId: string }) => Promise<UpgradeCheckoutReadModel | null>;
  getAuthenticatedUser: (request: Request) => Promise<AuthenticatedRequestContext | null>;
}) {
  return async function handleGetUpgradeCheckout(request: Request) {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return createErrorResponse(401, "UNAUTHORIZED", "Sign in to view billing state.");
    }

    try {
      const checkout = await getCheckoutState({ userId: user.userId });
      return Response.json({ checkout }, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("upgrade_checkout_get_failed", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}

export function createGetUpgradeCheckoutReturnStateRouteHandler({
  getCheckoutStateBySessionId,
}: {
  getCheckoutStateBySessionId: (input: {
    checkoutSessionId: string;
  }) => Promise<UpgradeCheckoutReadModel | null>;
}) {
  return async function handleGetUpgradeCheckoutReturnState(request: Request) {
    const sessionId = new URL(request.url).searchParams.get("session_id");
    const parsed = checkoutSessionIdSchema.safeParse(sessionId);

    if (!parsed.success) {
      return createErrorResponse(
        400,
        "INVALID_REQUEST",
        "Provide a valid Stripe checkout session id.",
      );
    }

    try {
      const checkout = await getCheckoutStateBySessionId({
        checkoutSessionId: parsed.data,
      });
      return Response.json({ checkout }, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("upgrade_checkout_return_state_failed", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}

export function createStartUpgradeCheckoutRouteHandler({
  startCheckout,
  getAuthenticatedUser,
}: {
  startCheckout: (input: {
    userId: string;
    email: string;
    name: string | null;
    planId: "team" | "enterprise";
    billingCycle: "monthly" | "annual";
    seats: number;
    successUrl: string;
    cancelUrl: string;
  }) => Promise<{
    checkout: UpgradeCheckoutReadModel;
    checkoutUrl: string;
  }>;
  getAuthenticatedUser: (request: Request) => Promise<AuthenticatedRequestContext | null>;
}) {
  return async function handleStartUpgradeCheckout(request: Request) {
    const user = await getAuthenticatedUser(request);

    if (!user) {
      return createErrorResponse(401, "UNAUTHORIZED", "Sign in before starting checkout.");
    }

    if (!hasTrustedOrigin(request)) {
      return createErrorResponse(403, "UNTRUSTED_ORIGIN", "Send this request from the signed-in workspace.");
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
    }

    const parsed = startCheckoutSchema.safeParse(payload);

    if (!parsed.success) {
      return createErrorResponse(400, "INVALID_REQUEST", "Send a valid plan, billing cycle, and seat count.");
    }

    try {
      const origin = new URL(request.url).origin;
      const checkout = await startCheckout({
        userId: user.userId,
        email: user.email,
        name: user.name,
        ...parsed.data,
        successUrl: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${origin}/checkout/return?canceled=1`,
      });
      return Response.json(checkout, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("upgrade_checkout_start_failed", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}

export function createStripeWebhookRouteHandler({
  billingWebhookVerifier,
  applyBillingWebhook,
}: {
  billingWebhookVerifier: BillingWebhookVerifier;
  applyBillingWebhook: (input: { event: NonNullable<Awaited<ReturnType<BillingWebhookVerifier["verifyAndParse"]>>> }) => Promise<{ applied: boolean }>;
}) {
  return async function handleStripeWebhook(request: Request) {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    try {
      const event = await billingWebhookVerifier.verifyAndParse(payload, signature);

      if (!event) {
        return new Response(null, { status: 204 });
      }

      await applyBillingWebhook({ event });
      return Response.json({ received: true }, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("stripe_webhook_failed", error);
      return createErrorResponse(400, "INVALID_WEBHOOK", "Stripe webhook verification failed.");
    }
  };
}
