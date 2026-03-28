import { CommercialAccount } from "@/domain/commercial-upgrade/commercial-account";
import type { TrackedChannelRepository } from "@/ports/tracked-channel-repository";
import type { CommercialSubscriptionRepository } from "@/ports/commercial-subscription-repository";
import type { TrackedChannel } from "@/ports/tracked-channel-repository";

export function createListTrackedChannelsQueryHandler({
  commercialSubscriptionRepository,
  trackedChannelRepository,
}: {
  commercialSubscriptionRepository: CommercialSubscriptionRepository;
  trackedChannelRepository: TrackedChannelRepository;
}) {
  return async function handleListTrackedChannelsQuery(input: {
    userId: string;
  }): Promise<TrackedChannel[]> {
    const account =
      (await commercialSubscriptionRepository.getByUserId(input.userId)) ??
      CommercialAccount.create(input.userId);

    account.assertHasEntitlement("weekly_tracking");

    return trackedChannelRepository.list(input.userId);
  };
}
