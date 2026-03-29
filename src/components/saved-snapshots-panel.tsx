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
    <section
      id="session-snapshots"
      className="neon-panel rounded-[34px] p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Free workflow</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
            Current session snapshots
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
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
              className="neon-button-outline rounded-3xl px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isClearing ? "Clearing" : "Clear session"}
            </button>
          ) : null}
          <div className="neon-chip rounded-3xl px-4 py-3 text-sm">
            {snapshots.length} snapshot{snapshots.length === 1 ? "" : "s"} in this session
          </div>
        </div>
      </div>

      {isLoading ? (
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
      ) : snapshots.length === 0 ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Save a browser-session snapshot to keep a quick reference list during the current demo.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {snapshots.map((snapshot) => (
            <article
              key={snapshot.snapshotId}
              className="neon-shell-soft rounded-3xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={snapshot.channel.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-2xl border border-(--color-border) object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
                      {snapshot.label || snapshot.channel.title}
                    </p>
                    {snapshot.label ? (
                      <p className="mt-1 text-sm text-(--color-muted)">
                        {snapshot.channel.title}
                      </p>
                    ) : null}
                  </div>
                </div>
                <p className="text-right text-xs uppercase tracking-[0.16em] neon-muted-copy">
                  {snapshot.window.label}
                </p>
              </div>

              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-(--color-muted)">Saved</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatDateTime(snapshot.savedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Top performer</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {snapshot.topPerformer ? snapshot.topPerformer.title : "No videos"}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Velocity</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {snapshot.topPerformer
                      ? `${formatCompactNumber(snapshot.topPerformer.viewsPerDay)}/day`
                      : "n/a"}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Channel URL</dt>
                  <dd className="mt-1">
                    <a
                      href={snapshot.channel.channelUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="neon-link font-medium"
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
