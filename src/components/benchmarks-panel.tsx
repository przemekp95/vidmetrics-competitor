"use client";

import { useMemo, useState } from "react";
import { Layers3, Lock } from "lucide-react";

import type {
  AnalysisSnapshotReadModel,
  TrackedChannelReadModel,
} from "@/application/read-models/analysis-read-model";
import {
  type PixiMetricDatum,
} from "@/components/visual-system/pixi-metric-chart-stage";
import { ResponsivePixiMetricSurface } from "@/components/visual-system/responsive-pixi-metric-surface";
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
  const viewsStageItems = useMemo<PixiMetricDatum[]>(
    () =>
      selectedCandidates.map((candidate, index) => ({
        id: candidate.id,
        label: candidate.label,
        value: candidate.averageViewsPerDay,
        color: [0x56faff, 0xff63d8, 0x8c63ff][index] ?? 0x56faff,
      })),
    [selectedCandidates],
  );
  const engagementStageItems = useMemo<PixiMetricDatum[]>(
    () =>
      selectedCandidates.map((candidate, index) => ({
        id: `${candidate.id}:engagement`,
        label: candidate.label,
        value: candidate.averageEngagementRate * 100,
        color: [0x36ffc9, 0x56faff, 0xff63d8][index] ?? 0x36ffc9,
      })),
    [selectedCandidates],
  );

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
    <section id="benchmarks" className="neon-panel neon-grid rounded-[34px] p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Paid workflow</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
            Multi-channel benchmarks
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
            Compare up to three saved reports or tracked channels in a Pixi-rendered benchmark
            surface.
          </p>
        </div>

        {!isEnabled ? (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="neon-button-outline inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
          >
            <Lock className="h-4 w-4" />
            Upgrade to unlock
          </button>
        ) : null}
      </div>

      {!isEnabled ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Activate the subscription before comparing tracked channels and durable reports inside the
          benchmark workspace.
        </div>
      ) : candidates.length === 0 ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
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
                      ? "border-[rgba(86,250,255,0.44)] bg-[rgba(86,250,255,0.12)]"
                      : "border-[rgba(112,132,191,0.24)] bg-[rgba(8,15,31,0.64)] hover:border-[rgba(86,250,255,0.48)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
                        {candidate.label}
                      </p>
                      <p className="mt-1 text-sm neon-muted-copy">{candidate.channelTitle}</p>
                    </div>
                    <span className="rounded-full border border-[rgba(112,132,191,0.22)] bg-[rgba(8,15,31,0.84)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] neon-muted-copy">
                      {candidate.sourceLabel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedCandidates.length > 0 ? (
            <div className="mt-6 grid gap-4">
              <div className="grid gap-4 xl:grid-cols-2">
                <article className="neon-shell rounded-[30px] p-4">
                  <p className="eyebrow">Views / day</p>
                  <div className="mt-4 h-72">
                    <ResponsivePixiMetricSurface
                      height={264}
                      items={viewsStageItems}
                      testId="benchmark-views-stage"
                    />
                  </div>
                </article>

                <article className="neon-shell rounded-[30px] p-4">
                  <p className="eyebrow">Engagement %</p>
                  <div className="mt-4 h-72">
                    <ResponsivePixiMetricSurface
                      height={264}
                      items={engagementStageItems}
                      testId="benchmark-engagement-stage"
                    />
                  </div>
                </article>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                {selectedCandidates.map((candidate) => (
                  <article key={candidate.id} className="neon-shell-soft rounded-3xl p-5">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                      <Layers3 className="h-4 w-4" />
                      {candidate.sourceLabel}
                    </p>
                    <h3 className="mt-3 text-xl font-semibold tracking-tight text-(--color-foreground)">
                      {candidate.label}
                    </h3>
                    <dl className="mt-4 grid gap-3 text-sm">
                      <div>
                        <dt className="neon-muted-copy">Uploads</dt>
                        <dd className="mt-1 font-medium text-(--color-foreground)">
                          {candidate.uploadCount}
                        </dd>
                      </div>
                      <div>
                        <dt className="neon-muted-copy">Avg views / day</dt>
                        <dd className="mt-1 font-medium text-(--color-foreground)">
                          {formatCompactNumber(candidate.averageViewsPerDay)}
                        </dd>
                      </div>
                      <div>
                        <dt className="neon-muted-copy">Avg engagement</dt>
                        <dd className="mt-1 font-medium text-(--color-foreground)">
                          {formatPercent(candidate.averageEngagementRate)}
                        </dd>
                      </div>
                      <div>
                        <dt className="neon-muted-copy">Top performer</dt>
                        <dd className="mt-1 font-medium text-(--color-foreground)">
                          {candidate.topPerformerTitle ?? "No videos in window"}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
