import { describe, expect, it, vi } from "vitest";

import {
  createConfirmUpgradeCheckoutRouteHandler,
  createGetUpgradeCheckoutRouteHandler,
  createStartUpgradeCheckoutRouteHandler,
} from "@/transport/http/upgrade-checkout-route";

const checkoutPayload = {
  status: "draft",
  planId: "team",
  planLabel: "Team Pulse",
  billingCycle: "monthly",
  seats: 5,
  displayPrice: "$245/mo",
  includedFeatures: [
    "Saved reports",
    "Weekly tracking",
    "Team sharing",
  ],
  buyerName: null,
  buyerEmail: null,
  companyName: null,
  submittedAt: null,
  confirmationCode: null,
};

describe("upgrade checkout route handlers", () => {
  it("requires a browser session header for the query route", async () => {
    const handler = createGetUpgradeCheckoutRouteHandler({
      getCheckoutState: vi.fn(),
    });

    const response = await handler(new Request("http://localhost/api/upgrade-checkout"));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "MISSING_SESSION",
        message: "Open a fresh browser session and try again.",
      },
    });
  });

  it("validates the start checkout payload before hitting the use case", async () => {
    const startCheckout = vi.fn();
    const handler = createStartUpgradeCheckoutRouteHandler({
      startCheckout,
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": "session-a",
        },
        body: JSON.stringify({
          planId: "team",
          billingCycle: "monthly",
          seats: 0,
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(startCheckout).not.toHaveBeenCalled();
  });

  it("passes valid draft payloads to the start command", async () => {
    const startCheckout = vi.fn().mockResolvedValue(checkoutPayload);
    const handler = createStartUpgradeCheckoutRouteHandler({
      startCheckout,
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout/start", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": "session-a",
        },
        body: JSON.stringify({
          planId: "team",
          billingCycle: "monthly",
          seats: 5,
        }),
      }),
    );

    expect(startCheckout).toHaveBeenCalledWith({
      sessionId: "session-a",
      planId: "team",
      billingCycle: "monthly",
      seats: 5,
    });
    expect(response.status).toBe(200);
  });

  it("validates the buyer details payload for confirmation", async () => {
    const confirmCheckout = vi.fn();
    const handler = createConfirmUpgradeCheckoutRouteHandler({
      confirmCheckout,
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout/confirm", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-vidmetrics-session-id": "session-a",
        },
        body: JSON.stringify({
          buyerName: "",
          buyerEmail: "not-an-email",
          companyName: "",
        }),
      }),
    );

    expect(response.status).toBe(400);
    expect(confirmCheckout).not.toHaveBeenCalled();
  });

  it("uses the browser session header for state queries", async () => {
    const getCheckoutState = vi.fn().mockResolvedValue(checkoutPayload);
    const handler = createGetUpgradeCheckoutRouteHandler({
      getCheckoutState,
    });

    const response = await handler(
      new Request("http://localhost/api/upgrade-checkout", {
        headers: {
          "x-vidmetrics-session-id": "session-b",
        },
      }),
    );

    expect(getCheckoutState).toHaveBeenCalledWith({
      sessionId: "session-b",
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      checkout: checkoutPayload,
    });
  });
});
