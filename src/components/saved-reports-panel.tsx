import Image from "next/image";
import { FolderKanban, LoaderCircle, Lock, Sparkles } from "lucide-react";

import type {
  AnalysisSnapshotReadModel,
  ChannelAnalysisReadModel,
} from "@/application/read-models/analysis-read-model";
import { formatCompactNumber, formatDateTime, formatPercent } from "@/lib/formatters";

export function SavedReportsPanel({
  reports,
  isLoading,
  isSaving,
  isEnabled,
  analysis,
  onSaveCurrentAnalysis,
  onOpenCheckout,
}: {
  reports: AnalysisSnapshotReadModel[];
  isLoading: boolean;
  isSaving: boolean;
  isEnabled: boolean;
  analysis: ChannelAnalysisReadModel | null;
  onSaveCurrentAnalysis: () => Promise<void>;
  onOpenCheckout: () => void;
}) {
  return (
    <section
      id="durable-reports"
      className="neon-panel rounded-[34px] p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Paid workflow</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
            Saved reports
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
            Durable reports stay attached to the signed-in account after checkout, unlike free
            browser-session snapshots.
          </p>
        </div>

        {isEnabled ? (
          <button
            type="button"
            onClick={() => void onSaveCurrentAnalysis()}
            disabled={isSaving || !analysis}
            className="neon-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving report
              </>
            ) : (
              <>
                <FolderKanban className="h-4 w-4" />
                Save current analysis
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="neon-button-outline inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
          >
            <Lock className="h-4 w-4" />
            Upgrade to unlock
          </button>
        )}
      </div>

      {!isEnabled ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Complete the Stripe sandbox subscription and wait for webhook-confirmed activation before
          saving durable client reports.
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="rounded-3xl border border-(--color-border) bg-[rgba(8,15,31,0.48)] p-5"
            >
              <div className="neon-skeleton h-3 w-20 rounded-full" />
              <div className="neon-skeleton mt-4 h-6 w-3/4 rounded-full" />
              <div className="neon-skeleton mt-3 h-3 w-1/2 rounded-full" />
            </div>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Save the current analysis to start building an account-level report library.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {reports.map((report) => (
            <article
              key={report.snapshotId}
              className="neon-shell-soft rounded-3xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={report.channel.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-2xl border border-(--color-border) object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
                      {report.label || report.channel.title}
                    </p>
                    <p className="mt-1 text-sm text-(--color-muted)">{report.channel.title}</p>
                  </div>
                </div>
                <span className="neon-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
                  {report.window.label}
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-(--color-muted)">Saved</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatDateTime(report.savedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Uploads</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {report.summary.uploadCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Avg views / day</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatCompactNumber(report.summary.averageViewsPerDay)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Avg engagement</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatPercent(report.summary.averageEngagementRate)}
                  </dd>
                </div>
              </dl>

              {report.topPerformer ? (
                <div className="mt-5 rounded-3xl border border-[rgba(86,250,255,0.16)] bg-[rgba(6,30,34,0.62)] p-4 text-sm">
                  <p className="inline-flex items-center gap-2 font-semibold text-(--color-accent)">
                    <Sparkles className="h-4 w-4" />
                    Top performer
                  </p>
                  <p className="mt-2 text-(--color-foreground)">{report.topPerformer.title}</p>
                  <p className="mt-1 text-(--color-muted)">
                    {formatCompactNumber(report.topPerformer.viewsPerDay)} views/day
                  </p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
