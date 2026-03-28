"use client";

import { useEffect, useState } from "react";

import type { TrackedChannelReadModel } from "@/application/read-models/analysis-read-model";
import { TrackedChannelsPanel } from "@/components/tracked-channels-panel";
import { readApiResponse } from "@/lib/read-api-response";

export function TrackedChannelsRouteView() {
  const [trackedChannels, setTrackedChannels] = useState<TrackedChannelReadModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadTrackedChannels() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/tracked-channels", {
          method: "GET",
        });

        const payload = await readApiResponse<{
          trackedChannels: TrackedChannelReadModel[];
        }>(response, {
          errorMessage: "Unable to load tracked channels.",
          unexpectedResponseMessage:
            "Tracked channels are temporarily unavailable. Refresh and try again.",
        });

        if (isActive) {
          setTrackedChannels(payload.trackedChannels);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadTrackedChannels();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <TrackedChannelsPanel
      trackedChannels={trackedChannels}
      isLoading={isLoading}
      isSaving={false}
      isEnabled
      analysis={null}
      onTrackCurrentChannel={async () => undefined}
      onOpenCheckout={() => undefined}
    />
  );
}
