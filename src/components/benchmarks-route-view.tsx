"use client";

import { useEffect, useState } from "react";

import type {
  AnalysisSnapshotReadModel,
  TrackedChannelReadModel,
} from "@/application/read-models/analysis-read-model";
import { BenchmarksPanel } from "@/components/benchmarks-panel";
import { readApiResponse } from "@/lib/read-api-response";

export function BenchmarksRouteView() {
  const [reports, setReports] = useState<AnalysisSnapshotReadModel[]>([]);
  const [trackedChannels, setTrackedChannels] = useState<TrackedChannelReadModel[]>([]);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      const [reportsResponse, trackedChannelsResponse] = await Promise.all([
        fetch("/api/saved-reports", { method: "GET" }),
        fetch("/api/tracked-channels", { method: "GET" }),
      ]);
      const [reportsPayload, trackedChannelsPayload] = await Promise.all([
        readApiResponse<{ reports: AnalysisSnapshotReadModel[] }>(reportsResponse, {
          errorMessage: "Unable to load saved reports.",
          unexpectedResponseMessage:
            "Saved reports are temporarily unavailable. Refresh and try again.",
        }),
        readApiResponse<{ trackedChannels: TrackedChannelReadModel[] }>(trackedChannelsResponse, {
          errorMessage: "Unable to load tracked channels.",
          unexpectedResponseMessage:
            "Tracked channels are temporarily unavailable. Refresh and try again.",
        }),
      ]);

      if (!isActive) {
        return;
      }

      setReports(reportsPayload.reports);
      setTrackedChannels(trackedChannelsPayload.trackedChannels);
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <BenchmarksPanel
      reports={reports}
      trackedChannels={trackedChannels}
      isEnabled
      onOpenCheckout={() => undefined}
    />
  );
}
