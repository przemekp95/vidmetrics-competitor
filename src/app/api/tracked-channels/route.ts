import { createSaveTrackedChannelCommandHandler } from "@/application/commands/save-tracked-channel-command-handler";
import { toTrackedChannelReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import { createListTrackedChannelsQueryHandler } from "@/application/queries/list-tracked-channels-query-handler";
import { getCommercialRuntime } from "@/infrastructure/commercial-upgrade/commercial-runtime";
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user";
import { createTrackedChannelsRouteHandlers } from "@/transport/http/paid-workflows-route";

export const runtime = "nodejs";

const { commercialSubscriptionRepository, trackedChannelRepository } = getCommercialRuntime();
const listTrackedChannelsQueryHandler = createListTrackedChannelsQueryHandler({
  commercialSubscriptionRepository,
  trackedChannelRepository,
});
const saveTrackedChannelCommandHandler = createSaveTrackedChannelCommandHandler({
  commercialSubscriptionRepository,
  trackedChannelRepository,
});
const handlers = createTrackedChannelsRouteHandlers({
  listTrackedChannels: async ({ userId }) =>
    (await listTrackedChannelsQueryHandler({ userId })).map((trackedChannel) =>
      toTrackedChannelReadModel({
        trackedChannelId: trackedChannel.trackedChannelId,
        createdAt: trackedChannel.createdAt,
        refreshedAt: trackedChannel.refreshedAt,
        analysis: trackedChannel.latestAnalysis,
      }),
    ),
  saveTrackedChannel: async (input) => saveTrackedChannelCommandHandler(input),
  getAuthenticatedUser: async () => getAuthenticatedUser(),
});

export const GET = handlers.GET;
export const POST = handlers.POST;
