import { z } from "zod";

import { isApplicationError } from "@/shared/application-error";

type AnalyzeRequestGuard = {
  consume: (requesterKey: string) => void;
  runDeduped: <T>(analysisKey: string, operation: () => Promise<T>) => Promise<T>;
};

const analyzeRequestSchema = z.object({
  channelUrl: z.string().trim().min(1).max(300),
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

function getRequesterKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "anonymous";
  }

  return request.headers.get("x-real-ip")?.trim() ?? "anonymous";
}

function createNoopRequestGuard(): AnalyzeRequestGuard {
  return {
    consume() {},
    runDeduped: (_analysisKey, operation) => operation(),
  };
}

export function createAnalyzeRouteHandler({
  analyzeCompetitorChannel,
  requestGuard = createNoopRequestGuard(),
}: {
  analyzeCompetitorChannel: (input: { channelUrl: string }) => Promise<unknown>;
  requestGuard?: AnalyzeRequestGuard;
}) {
  return async function handleAnalyzeRoute(request: Request) {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
    }

    const parsed = analyzeRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return createErrorResponse(400, "INVALID_REQUEST", "Enter a YouTube channel URL.");
    }

    try {
      requestGuard.consume(getRequesterKey(request));
      const analysis = await requestGuard.runDeduped(
        parsed.data.channelUrl.trim().toLowerCase(),
        () => analyzeCompetitorChannel(parsed.data),
      );
      return Response.json(analysis, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        if (error.status >= 500) {
          console.error("analyze_route_failed", {
            code: error.code,
            message: error.message,
            status: error.status,
          });
        }

        return createErrorResponse(error.status, error.code, error.publicMessage);
      }

      console.error("analyze_route_unexpected_error", error);
      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}
