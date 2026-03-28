"use client";

import { useMemo, useState } from "react";
import { Layers3, Lock } from "lucide-react";

import type {
  AnalysisSnapshotReadModel,
  TrackedChannelReadModel,
} from "@/application/read-models/analysis-read-model";
import { formatCompactNumber, formatPercent } from "@/lib/formatters";

type BenchmarkCandidate = {
  id: string;
  label: string;
  sourceLabel: string;
  channelTitle: string;
  uploadCount: number;
  averageViewsPerDay: number;
  averageEngagementRate: number;
  topPerformerTitle: string | null;
};

export function BenchmarksPanel({
  reports,
  trackedChannels,
  isEnabled,
  onOpenCheckout,
}: {
  reports: AnalysisSnapshotReadModel[];
  trackedChannels: TrackedChannelReadModel[];
  isEnabled: boolean;
  onOpenCheckout: () => void;
}) {
  const candidates = useMemo<BenchmarkCandidate[]>(
    () => [
      ...reports.map((report) => ({
        id: `report:${report.snapshotId}`,
        label: report.label || report.channel.title,
        sourceLabel: "Saved report",
        channelTitle: report.channel.title,
        uploadCount: report.summary.uploadCount,
        averageViewsPerDay: report.summary.averageViewsPerDay,
        averageEngagementRate: report.summary.averageEngagementRate,
        topPerformerTitle: report.topPerformer?.title ?? null,
      })),
      ...trackedChannels.map((trackedChannel) => ({
        id: `tracked:${trackedChannel.trackedChannelId}`,
        label: trackedChannel.channel.title,
        sourceLabel: "Tracked channel",
        channelTitle: trackedChannel.channel.title,
        uploadCount: trackedChannel.summary.uploadCount,
        averageViewsPerDay: trackedChannel.summary.averageViewsPerDay,
        averageEngagementRate: trackedChannel.summary.averageEngagementRate,
        topPerformerTitle: trackedChannel.summary.topPerformer?.title ?? null,
      })),
    ],
    [reports, trackedChannels],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedCandidates = candidates.filter((candidate) => selectedIds.includes(candidate.id));

  function toggleSelection(candidateId: string) {
    setSelectedIds((currentIds) => {
      if (currentIds.includes(candidateId)) {
        return currentIds.filter((id) => id !== candidateId);
      }

      if (currentIds.length >= 3) {
        return currentIds;
      }

      return [...currentIds, candidateId];
    });
  }

  return (
    <section
      id="benchmarks"
      className="rounded-4xl border border-(--color-border) bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
            Paid workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground)">
            Multi-channel benchmarks
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-(--color-muted)">
            Compare up to three saved reports or tracked channels using current summary metrics.
          </p>
        </div>

        {!isEnabled ? (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--border-interactive) bg-[rgba(255,252,246,0.92)] px-5 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            <Lock className="h-4 w-4" />
            Upgrade to unlock
          </button>
        ) : null}
      </div>

      {!isEnabled ? (
        <div className="mt-6 rounded-3xl border border-dashed border-(--border-interactive) bg-[rgba(255,252,246,0.74)] p-5 text-sm leading-6 text-(--color-muted)">
          Activate the subscription before comparing tracked channels and durable reports inside the
          benchmark workspace.
        </div>
      ) : candidates.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-(--color-border) bg-[rgba(255,252,246,0.72)] p-5 text-sm leading-6 text-(--color-muted)">
          Save at least one durable report or tracked channel to benchmark multiple competitors.
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 xl:grid-cols-3">
            {candidates.map((candidate) => {
              const selected = selectedIds.includes(candidate.id);

              return (
                <button
                  key={candidate.id}
                  type="button"
                  onClick={() => toggleSelection(candidate.id)}
                  className={`rounded-3xl border p-4 text-left transition ${
                    selected
                      ? "border-(--color-accent) bg-[rgba(16,120,105,0.08)]"
                      : "border-(--color-border) bg-[rgba(255,252,246,0.74)] hover:border-(--color-accent)"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
                        {candidate.label}
                      </p>
                      <p className="mt-1 text-sm text-(--color-muted)">{candidate.channelTitle}</p>
                    </div>
                    <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-muted)">
                      {candidate.sourceLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCandidates.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-3">
              {selectedCandidates.map((candidate) => (
                <article
                  key={candidate.id}
                  className="rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.78)] p-5"
                >
                  <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                    <Layers3 className="h-4 w-4" />
                    {candidate.sourceLabel}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-(--color-foreground)">
                    {candidate.label}
                  </h3>
                  <dl className="mt-4 grid gap-3 text-sm">
                    <div>
                      <dt className="text-(--color-muted)">Uploads</dt>
                      <dd className="mt-1 font-medium text-(--color-foreground)">
                        {candidate.uploadCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-(--color-muted)">Avg views / day</dt>
                      <dd className="mt-1 font-medium text-(--color-foreground)">
                        {formatCompactNumber(candidate.averageViewsPerDay)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-(--color-muted)">Avg engagement</dt>
                      <dd className="mt-1 font-medium text-(--color-foreground)">
                        {formatPercent(candidate.averageEngagementRate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-(--color-muted)">Top performer</dt>
                      <dd className="mt-1 font-medium text-(--color-foreground)">
                        {candidate.topPerformerTitle ?? "No videos in window"}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
