"use client";

import { useEffect, useState } from "react";

import type { AnalysisSnapshotReadModel } from "@/application/read-models/analysis-read-model";
import { SavedReportsPanel } from "@/components/saved-reports-panel";
import { readApiResponse } from "@/lib/read-api-response";

export function SavedReportsRouteView() {
  const [reports, setReports] = useState<AnalysisSnapshotReadModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadReports() {
      setIsLoading(true);

      try {
        const response = await fetch("/api/saved-reports", {
          method: "GET",
        });

        const payload = await readApiResponse<{
          reports: AnalysisSnapshotReadModel[];
        }>(response, {
          errorMessage: "Unable to load saved reports.",
          unexpectedResponseMessage:
            "Saved reports are temporarily unavailable. Refresh and try again.",
        });

        if (isActive) {
          setReports(payload.reports);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadReports();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <SavedReportsPanel
      reports={reports}
      isLoading={isLoading}
      isSaving={false}
      isEnabled
      analysis={null}
      onSaveCurrentAnalysis={async () => undefined}
      onOpenCheckout={() => undefined}
    />
  );
}
