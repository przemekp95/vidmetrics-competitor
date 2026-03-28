import Image from "next/image";

import type { AnalysisSnapshotReadModel } from "@/application/read-models/analysis-read-model";
import { formatCompactNumber, formatDateTime } from "@/lib/formatters";

export function SavedSnapshotsPanel({
  snapshots,
  isLoading,
  isClearing,
  onClear,
}: {
  snapshots: AnalysisSnapshotReadModel[];
  isLoading: boolean;
  isClearing: boolean;
  onClear: () => void;
}) {
  return (
    <section className="rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Saved snapshots
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Current session
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--color-muted)]">
            Snapshot saves stay scoped to this browser session so your demo starts clean. They
            reset when you clear them, open a fresh browser session, or after a new deployment.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {snapshots.length > 0 ? (
            <button
              type="button"
              onClick={onClear}
              disabled={isClearing}
              className="rounded-[24px] border border-[color:var(--color-border)] bg-white px-4 py-3 text-sm font-medium text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClearing ? "Clearing" : "Clear session"}
            </button>
          ) : null}
          <div className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.9)] px-4 py-3 text-sm text-[color:var(--color-muted)]">
            {snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} in this session
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.72)] p-5"
            >
              <div className="h-3 w-20 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-4 h-6 w-3/4 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-3 h-3 w-1/2 rounded-full bg-[rgba(31,35,33,0.08)]" />
            </div>
          ))}
        </div>
      ) : snapshots.length === 0 ? (
        <div className="mt-6 rounded-[24px] border border-dashed border-[color:var(--color-border)] bg-[rgba(255,252,246,0.72)] p-5 text-sm leading-6 text-[color:var(--color-muted)]">
          Save an analysis snapshot to keep a quick reference list for the current demo session.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {snapshots.map((snapshot) => (
            <article
              key={snapshot.snapshotId}
              className="rounded-[24px] border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.78)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={snapshot.channel.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-2xl border border-[color:var(--color-border)] object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
                      {snapshot.label || snapshot.channel.title}
                    </p>
                    {snapshot.label ? (
                      <p className="mt-1 text-sm text-[color:var(--color-muted)]">
                        {snapshot.channel.title}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-right text-xs uppercase tracking-[0.16em] text-[color:var(--color-muted)]">
                  {snapshot.window.label}
                </p>
              </div>

              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-[color:var(--color-muted)]">Saved</dt>
                  <dd className="mt-1 font-medium text-[color:var(--color-foreground)]">
                    {formatDateTime(snapshot.savedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">Top performer</dt>
                  <dd className="mt-1 font-medium text-[color:var(--color-foreground)]">
                    {snapshot.topPerformer ? snapshot.topPerformer.title : "No videos"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">Velocity</dt>
                  <dd className="mt-1 font-medium text-[color:var(--color-foreground)]">
                    {snapshot.topPerformer
                      ? `${formatCompactNumber(snapshot.topPerformer.viewsPerDay)}/day`
                      : "n/a"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[color:var(--color-muted)]">Channel URL</dt>
                  <dd className="mt-1">
                    <a
                      href={snapshot.channel.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[color:var(--color-accent)] transition hover:opacity-80"
                    >
                      Open channel
                    </a>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
