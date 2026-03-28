import { z } from "zod";

import type {
  AnalysisSnapshotReadModel,
  ChannelAnalysisReadModel,
  SaveAnalysisSnapshotResponse,
} from "@/application/read-models/analysis-read-model";
import { isApplicationError } from "@/shared/application-error";

const topPerformerSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    viewsPerDay: z.number().int().nonnegative(),
    videoUrl: z.string().url(),
  })
  .nullable();

const analysisSchema = z.object({
  channel: z.object({
    id: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    avatarUrl: z.string().url(),
    subscriberCount: z.number().int().nonnegative(),
    channelUrl: z.string().url(),
  }),
  window: z.object({
    label: z.string().trim().min(1).max(80),
    monthKey: z.string().trim().regex(/^\d{4}-\d{2}$/u),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
  }),
  summary: z.object({
    uploadCount: z.number().int().nonnegative(),
    averageViewsPerDay: z.number().int().nonnegative(),
    averageEngagementRate: z.number().nonnegative(),
    topPerformer: topPerformerSchema,
  }),
  videos: z.array(
    z.object({
      id: z.string().trim().min(1).max(100),
      title: z.string().trim().min(1).max(200),
      videoUrl: z.string().url(),
      thumbnailUrl: z.string().url(),
      publishedAt: z.string().datetime(),
      durationText: z.string().trim().min(1).max(20),
      views: z.number().int().nonnegative(),
      likes: z.number().int().nonnegative(),
      comments: z.number().int().nonnegative(),
      viewsPerDay: z.number().int().nonnegative(),
      engagementRate: z.number().nonnegative(),
      trend: z.enum(["hot", "above_avg", "steady"]),
    }),
  ),
  source: z.object({
    provider: z.literal("youtube-data-api-v3"),
    cache: z.enum(["memory-ttl", "none"]),
  }),
});

const saveSnapshotRequestSchema = z.object({
  label: z.string().trim().max(80).optional(),
  analysis: analysisSchema,
});

const sessionIdSchema = z.string().trim().min(1).max(120);

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

export function createAnalysisSnapshotsRouteHandlers({
  saveAnalysisSnapshot,
  listAnalysisSnapshots,
  clearAnalysisSnapshots,
}: {
  saveAnalysisSnapshot: (input: {
    sessionId: string;
    label?: string;
    analysis: ChannelAnalysisReadModel;
  }) => Promise<SaveAnalysisSnapshotResponse>;
  listAnalysisSnapshots: (input: { sessionId: string }) => Promise<AnalysisSnapshotReadModel[]>;
  clearAnalysisSnapshots: (input: { sessionId: string }) => Promise<void>;
}) {
  return {
    async GET(request: Request) {
      const sessionId = getSessionId(request);

      if (!sessionId) {
        return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
      }

      try {
        const snapshots = await listAnalysisSnapshots({ sessionId });
        return Response.json({ snapshots }, { status: 200 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("analysis_snapshots_get_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },

    async POST(request: Request) {
      let payload: unknown;

      try {
        payload = await request.json();
      } catch {
        return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
      }

      const parsed = saveSnapshotRequestSchema.safeParse(payload);

      if (!parsed.success) {
        return createErrorResponse(400, "INVALID_REQUEST", "Send a valid analysis snapshot payload.");
      }

      try {
        const sessionId = getSessionId(request);

        if (!sessionId) {
          return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
        }

        const response = await saveAnalysisSnapshot({
          sessionId,
          ...parsed.data,
        });
        return Response.json(response, { status: 201 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("analysis_snapshots_post_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },

    async DELETE(request: Request) {
      const sessionId = getSessionId(request);

      if (!sessionId) {
        return createErrorResponse(400, "MISSING_SESSION", "Open a fresh browser session and try again.");
      }

      try {
        await clearAnalysisSnapshots({ sessionId });
        return new Response(null, { status: 204 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("analysis_snapshots_delete_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },
  };
}
