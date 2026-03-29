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
      className="neon-panel rounded-[34px] p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="eyebrow">Paid workflow</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
            Weekly tracking
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 neon-muted-copy">
            Pin channels to the account and manually refresh them from the latest workspace
            analysis. No cron automation in this MVP.
          </p>
        </div>

        {isEnabled ? (
          <button
            type="button"
            onClick={() => void onTrackCurrentChannel()}
            disabled={isSaving || !analysis}
            className="neon-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
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
            className="neon-button-outline inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
          >
            <Lock className="h-4 w-4" />
            Upgrade to unlock
          </button>
        )}
      </div>

      {!isEnabled ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Activate the paid plan to persist tracked channels and refresh them across sessions.
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
      ) : trackedChannels.length === 0 ? (
        <div className="neon-empty-state mt-6 rounded-3xl p-5 text-sm leading-6 neon-muted-copy">
          Analyze a channel and pin it here to start a manual weekly tracking list.
        </div>
      ) : (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {trackedChannels.map((trackedChannel) => (
            <article
              key={trackedChannel.trackedChannelId}
              className="neon-shell-soft rounded-3xl p-5"
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
                <span className="neon-badge rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
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
