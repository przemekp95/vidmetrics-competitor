import { fromChannelAnalysisReadModel } from "@/application/mappers/map-channel-analysis-to-read-model";
import type { ChannelAnalysisReadModel } from "@/application/read-models/analysis-read-model";
import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { TrackedChannelRepository } from "@/ports/tracked-channel-repository";

export function createSaveTrackedChannelCommandHandler({
  commercialSubscriptionRepository,
  trackedChannelRepository,
  now = () => new Date(),
  createTrackedChannelId = () => crypto.randomUUID(),
}: {
  commercialSubscriptionRepository: CommercialSubscriptionRepository;
  trackedChannelRepository: TrackedChannelRepository;
  now?: () => Date;
  createTrackedChannelId?: () => string;
}) {
  return async function handleSaveTrackedChannelCommand(input: {
    userId: string;
    analysis: ChannelAnalysisReadModel;
  }) {
    const account =
      (await commercialSubscriptionRepository.getByUserId(input.userId)) ??
      CommercialAccount.create(input.userId);

    account.assertHasEntitlement("weekly_tracking");

    const analysis = fromChannelAnalysisReadModel(input.analysis);
    const trackedAt = now().toISOString();
    const existingTrackedChannel = (await trackedChannelRepository.list(input.userId)).find(
      (trackedChannel) => trackedChannel.channelId === analysis.channel.id,
    );

    await trackedChannelRepository.save({
      trackedChannelId: existingTrackedChannel?.trackedChannelId ?? createTrackedChannelId(),
      userId: input.userId,
      channelId: analysis.channel.id,
      channelTitle: analysis.channel.title,
      channelUrl: analysis.channel.channelUrl,
      avatarUrl: analysis.channel.avatarUrl,
      createdAt: existingTrackedChannel?.createdAt ?? trackedAt,
      refreshedAt: trackedAt,
      latestAnalysis: analysis,
    });

    return {
      trackedAt,
    };
  };
}
