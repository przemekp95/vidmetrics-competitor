import Image from "next/image";
import { CalendarRange, LoaderCircle, Lock, RefreshCw } from "lucide-react";

import type {
  ChannelAnalysisReadModel,
  TrackedChannelReadModel,
} from "@/application/read-models/analysis-read-model";
import { formatCompactNumber, formatDateTime, formatPercent } from "@/lib/formatters";

export function TrackedChannelsPanel({
  trackedChannels,
  isLoading,
  isSaving,
  isEnabled,
  analysis,
  onTrackCurrentChannel,
  onOpenCheckout,
}: {
  trackedChannels: TrackedChannelReadModel[];
  isLoading: boolean;
  isSaving: boolean;
  isEnabled: boolean;
  analysis: ChannelAnalysisReadModel | null;
  onTrackCurrentChannel: () => Promise<void>;
  onOpenCheckout: () => void;
}) {
  return (
    <section
      id="weekly-tracking"
      className="rounded-4xl border border-(--color-border) bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-(--color-muted)">
            Paid workflow
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-(--color-foreground)">
            Weekly tracking
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-(--color-muted)">
            Pin channels to the account and manually refresh them from the latest workspace
            analysis. No cron automation in this MVP.
          </p>
        </div>

        {isEnabled ? (
          <button
            type="button"
            onClick={() => void onTrackCurrentChannel()}
            disabled={isSaving || !analysis}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-(--color-foreground) px-5 text-sm font-semibold text-(--color-background) transition hover:bg-(--color-accent) disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving channel
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Track or refresh current channel
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--border-interactive) bg-[rgba(255,252,246,0.92)] px-5 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            <Lock className="h-4 w-4" />
            Upgrade to unlock
          </button>
        )}
      </div>

      {!isEnabled ? (
        <div className="mt-6 rounded-3xl border border-dashed border-(--border-interactive) bg-[rgba(255,252,246,0.74)] p-5 text-sm leading-6 text-(--color-muted)">
          Activate the paid plan to persist tracked channels and refresh them across sessions.
        </div>
      ) : isLoading ? (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.72)] p-5"
            >
              <div className="h-3 w-20 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-4 h-6 w-3/4 rounded-full bg-[rgba(31,35,33,0.08)]" />
              <div className="mt-3 h-3 w-1/2 rounded-full bg-[rgba(31,35,33,0.08)]" />
            </div>
          ))}
        </div>
      ) : trackedChannels.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-(--color-border) bg-[rgba(255,252,246,0.72)] p-5 text-sm leading-6 text-(--color-muted)">
          Analyze a channel and pin it here to start a manual weekly tracking list.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {trackedChannels.map((trackedChannel) => (
            <article
              key={trackedChannel.trackedChannelId}
              className="rounded-3xl border border-(--color-border) bg-[rgba(255,252,246,0.78)] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={trackedChannel.channel.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-2xl border border-(--color-border) object-cover"
                  />
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
                      {trackedChannel.channel.title}
                    </p>
                    <p className="mt-1 text-sm text-(--color-muted)">
                      {trackedChannel.window.label}
                    </p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-(--color-accent)">
                  <CalendarRange className="h-3.5 w-3.5" />
                  Tracked
                </span>
              </div>

              <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-(--color-muted)">Created</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatDateTime(trackedChannel.createdAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Last refresh</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatDateTime(trackedChannel.refreshedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Avg views / day</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatCompactNumber(trackedChannel.summary.averageViewsPerDay)}
                  </dd>
                </div>
                <div>
                  <dt className="text-(--color-muted)">Avg engagement</dt>
                  <dd className="mt-1 font-medium text-(--color-foreground)">
                    {formatPercent(trackedChannel.summary.averageEngagementRate)}
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
