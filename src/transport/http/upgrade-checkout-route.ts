import { z } from "zod";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";
import { isApplicationError } from "@/shared/application-error";

const sessionIdSchema = z.string().trim().min(1).max(120);

const startCheckoutSchema = z.object({
  planId: z.enum(["team", "enterprise"]),
  billingCycle: z.enum(["monthly", "annual"]),
  seats: z.number().int().min(1).max(250),
});

const confirmCheckoutSchema = z.object({
  buyerName: z.string().trim().min(1).max(120),
  buyerEmail: z.string().trim().email().max(160),
  companyName: z.string().trim().min(1).max(160),
});

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

function getSessionId(request: Request) {
  const parsed = sessionIdSchema.safeParse(request.headers.get("x-vidmetrics-session-id"));
  return parsed.success ? parsed.data : null;
}

export function createGetUpgradeCheckoutRouteHandler({
  getCheckoutState,
}: {
  getCheckoutState: (input: { sessionId: string }) => Promise<UpgradeCheckoutReadModel | null>;
}) {
  return async function handleGetUpgradeCheckout(request: Request) {
    const sessionId = getSessionId(request);

    if (!sessionId) {
      return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
    }

    try {
      const checkout = await getCheckoutState({ sessionId });
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

export function createStartUpgradeCheckoutRouteHandler({
  startCheckout,
}: {
  startCheckout: (input: {
    sessionId: string;
    planId: "team" | "enterprise";
    billingCycle: "monthly" | "annual";
    seats: number;
  }) => Promise<UpgradeCheckoutReadModel>;
}) {
  return async function handleStartUpgradeCheckout(request: Request) {
    const sessionId = getSessionId(request);

    if (!sessionId) {
      return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
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
      const checkout = await startCheckout({
        sessionId,
        ...parsed.data,
      });
      return Response.json({ checkout }, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("upgrade_checkout_start_failed", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}

export function createConfirmUpgradeCheckoutRouteHandler({
  confirmCheckout,
}: {
  confirmCheckout: (input: {
    sessionId: string;
    buyerName: string;
    buyerEmail: string;
    companyName: string;
  }) => Promise<UpgradeCheckoutReadModel>;
}) {
  return async function handleConfirmUpgradeCheckout(request: Request) {
    const sessionId = getSessionId(request);

    if (!sessionId) {
      return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
    }

    const parsed = confirmCheckoutSchema.safeParse(payload);

    if (!parsed.success) {
      return createErrorResponse(400, "INVALID_REQUEST", "Send valid buyer and company details.");
    }

    try {
      const checkout = await confirmCheckout({
        sessionId,
        ...parsed.data,
      });
      return Response.json({ checkout }, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("upgrade_checkout_confirm_failed", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}
