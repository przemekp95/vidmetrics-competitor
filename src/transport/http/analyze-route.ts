import { z } from "zod";

import { isApplicationError } from "@/shared/application-error";

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

export function createAnalyzeRouteHandler({
  analyzeCompetitorChannel,
}: {
  analyzeCompetitorChannel: (input: { channelUrl: string }) => Promise<unknown>;
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
      const analysis = await analyzeCompetitorChannel(parsed.data);
      return Response.json(analysis, { status: 200 });
    } catch (error) {
      if (isApplicationError(error)) {
        return createErrorResponse(error.status, error.code, error.message);
      }

      return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
    }
  };
}
