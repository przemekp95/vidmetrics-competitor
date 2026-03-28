import { describe, expect, it } from "vitest";

import { readApiResponse } from "@/lib/read-api-response";

describe("readApiResponse", () => {
  it("returns parsed JSON for a successful JSON response", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    });

    await expect(
      readApiResponse<{ ok: boolean }>(response, {
        errorMessage: "Request failed.",
      }),
    ).resolves.toEqual({ ok: true });
  });

  it("prefers the structured API error message for JSON failures", async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          message: "Channel URL is invalid.",
        },
      }),
      {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      },
    );

    await expect(
      readApiResponse(response, {
        errorMessage: "Request failed.",
      }),
    ).rejects.toThrow("Channel URL is invalid.");
  });

  it("maps unexpected HTML responses to a safe message", async () => {
    const response = new Response("<!DOCTYPE html><html><body>broken</body></html>", {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });

    await expect(
      readApiResponse(response, {
        errorMessage: "Request failed.",
        unexpectedResponseMessage: "The service returned an unexpected response. Refresh and try again.",
      }),
    ).rejects.toThrow("The service returned an unexpected response. Refresh and try again.");
  });
});
