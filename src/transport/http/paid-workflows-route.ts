import { z } from "zod";

import type {
  AnalysisSnapshotReadModel,
  ChannelAnalysisReadModel,
  SaveAnalysisSnapshotResponse,
  TrackedChannelReadModel,
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

const savePayloadSchema = z.object({
  label: z.string().trim().max(80).optional(),
  analysis: analysisSchema,
});

const trackPayloadSchema = z.object({
  analysis: analysisSchema,
});

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

export function createSavedReportsRouteHandlers({
  listSavedReports,
  saveSavedReport,
  getAuthenticatedUser,
}: {
  listSavedReports: (input: { userId: string }) => Promise<AnalysisSnapshotReadModel[]>;
  saveSavedReport: (input: {
    userId: string;
    label?: string;
    analysis: ChannelAnalysisReadModel;
  }) => Promise<SaveAnalysisSnapshotResponse>;
  getAuthenticatedUser: (request: Request) => Promise<AuthenticatedRequestContext | null>;
}) {
  return {
    async GET(request: Request) {
      const user = await getAuthenticatedUser(request);

      if (!user) {
        return createErrorResponse(401, "UNAUTHORIZED", "Sign in to view saved reports.");
      }

      try {
        const reports = await listSavedReports({ userId: user.userId });
        return Response.json({ reports }, { status: 200 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("saved_reports_get_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },

    async POST(request: Request) {
      const user = await getAuthenticatedUser(request);

      if (!user) {
        return createErrorResponse(401, "UNAUTHORIZED", "Sign in before saving a report.");
      }

      if (!hasTrustedOrigin(request)) {
        return createErrorResponse(
          403,
          "UNTRUSTED_ORIGIN",
          "Send this request from the signed-in workspace.",
        );
      }

      let payload: unknown;

      try {
        payload = await request.json();
      } catch {
        return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
      }

      const parsed = savePayloadSchema.safeParse(payload);

      if (!parsed.success) {
        return createErrorResponse(400, "INVALID_REQUEST", "Send a valid saved report payload.");
      }

      try {
        const report = await saveSavedReport({
          userId: user.userId,
          ...parsed.data,
        });
        return Response.json(report, { status: 201 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("saved_reports_post_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },
  };
}

export function createTrackedChannelsRouteHandlers({
  listTrackedChannels,
  saveTrackedChannel,
  getAuthenticatedUser,
}: {
  listTrackedChannels: (input: { userId: string }) => Promise<TrackedChannelReadModel[]>;
  saveTrackedChannel: (input: {
    userId: string;
    analysis: ChannelAnalysisReadModel;
  }) => Promise<{ trackedAt: string }>;
  getAuthenticatedUser: (request: Request) => Promise<AuthenticatedRequestContext | null>;
}) {
  return {
    async GET(request: Request) {
      const user = await getAuthenticatedUser(request);

      if (!user) {
        return createErrorResponse(401, "UNAUTHORIZED", "Sign in to view tracked channels.");
      }

      try {
        const trackedChannels = await listTrackedChannels({
          userId: user.userId,
        });
        return Response.json({ trackedChannels }, { status: 200 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("tracked_channels_get_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },

    async POST(request: Request) {
      const user = await getAuthenticatedUser(request);

      if (!user) {
        return createErrorResponse(401, "UNAUTHORIZED", "Sign in before tracking a channel.");
      }

      if (!hasTrustedOrigin(request)) {
        return createErrorResponse(
          403,
          "UNTRUSTED_ORIGIN",
          "Send this request from the signed-in workspace.",
        );
      }

      let payload: unknown;

      try {
        payload = await request.json();
      } catch {
        return createErrorResponse(400, "INVALID_REQUEST_BODY", "Send a valid JSON payload.");
      }

      const parsed = trackPayloadSchema.safeParse(payload);

      if (!parsed.success) {
        return createErrorResponse(400, "INVALID_REQUEST", "Send a valid tracking payload.");
      }

      try {
        const trackedChannel = await saveTrackedChannel({
          userId: user.userId,
          analysis: parsed.data.analysis,
        });
        return Response.json(trackedChannel, { status: 201 });
      } catch (error) {
        if (isApplicationError(error)) {
          return createErrorResponse(error.status, error.code, error.publicMessage);
        }

        console.error("tracked_channels_post_failed", error);
        return createErrorResponse(500, "INTERNAL_ERROR", "Unexpected server error.");
      }
    },
  };
}
