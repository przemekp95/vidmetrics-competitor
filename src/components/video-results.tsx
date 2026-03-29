import Image from "next/image";

import type { CompetitorVideoReadModel } from "@/application/read-models/analysis-read-model";
import {
  formatCompactNumber,
  formatInteger,
  formatPercent,
  formatPublishedDate,
} from "@/lib/formatters";

function TrendBadge({ trend }: { trend: CompetitorVideoReadModel["trend"] }) {
  const theme =
    trend === "hot"
      ? "bg-[rgba(16,120,105,0.12)] text-[color:var(--color-accent)]"
      : trend === "above_avg"
        ? "bg-[rgba(255,194,102,0.2)] text-[color:var(--color-sun-deep)]"
        : "bg-[rgba(31,35,33,0.08)] text-[color:var(--color-foreground-soft)]";

  const label = trend === "hot" ? "Hot" : trend === "above_avg" ? "Above Avg" : "Steady";

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${theme}`}>
      {label}
    </span>
  );
}

export function VideoResults({
  videos,
}: {
  videos: CompetitorVideoReadModel[];
}) {
  if (videos.length === 0) {
    return (
      <section className="neon-empty-state rounded-[32px] p-8">
        <h2 className="text-xl font-semibold tracking-tight neon-title">
          No qualifying videos yet
        </h2>
        <p className="mt-3 max-w-xl text-sm leading-6 neon-muted-copy">
          This channel does not have public uploads inside the active month window. Try another
          competitor or wait for new uploads.
        </p>
      </section>
    );
  }

  return (
    <section className="neon-panel rounded-[32px]">
      <div className="flex items-center justify-between gap-4 border-b neon-divider px-6 py-5">
        <div>
          <p className="eyebrow">Video table</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
            Current-month winners
          </h2>
        </div>
        <p className="max-w-sm text-right text-sm leading-6 neon-muted-copy">
          Sort and filter to isolate the clips driving the strongest public momentum right now.
        </p>
      </div>

      <div className="hidden overflow-x-auto xl:block">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="border-b neon-divider bg-[rgba(8,15,31,0.72)] text-left text-xs uppercase tracking-[0.18em] text-[color:var(--color-muted)]">
              <th className="px-6 py-4">Video</th>
              <th className="px-4 py-4">Published</th>
              <th className="px-4 py-4">Duration</th>
              <th className="px-4 py-4">Views</th>
              <th className="px-4 py-4">Views / day</th>
              <th className="px-4 py-4">Engagement</th>
              <th className="px-4 py-4">Comments</th>
              <th className="px-4 py-4">Trend</th>
            </tr>
          </thead>
          <tbody>
            {videos.map((video) => (
              <tr
                key={video.id}
                className="neon-table-row border-b align-top"
              >
                <td className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <Image
                      src={video.thumbnailUrl}
                      alt=""
                      width={128}
                      height={80}
                      className="h-20 w-32 rounded-2xl object-cover shadow-[0_12px_20px_rgba(31,35,33,0.08)]"
                    />
                    <div className="min-w-0">
                      <a
                        href={video.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="neon-link line-clamp-2 text-base font-semibold tracking-tight text-[color:var(--color-foreground)]"
                      >
                        {video.title}
                      </a>
                      <p className="mt-2 text-sm text-[color:var(--color-muted)]">
                        Public metrics only. Private analytics are not available for competitor
                        channels.
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-sm text-[color:var(--color-muted)]">
                  {formatPublishedDate(video.publishedAt)}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-[color:var(--color-foreground)]">
                  {video.durationText}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-[color:var(--color-foreground)]">
                  {formatInteger(video.views)}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-[color:var(--color-foreground)]">
                  {formatCompactNumber(video.viewsPerDay)}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-[color:var(--color-foreground)]">
                  {formatPercent(video.engagementRate)}
                </td>
                <td className="px-4 py-5 text-sm font-medium text-[color:var(--color-foreground)]">
                  {formatInteger(video.comments)}
                </td>
                <td className="px-4 py-5">
                  <TrendBadge trend={video.trend} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 p-4 xl:hidden">
        {videos.map((video) => (
          <article
            key={video.id}
            className="neon-shell-soft rounded-[28px] p-4"
          >
            <Image
              src={video.thumbnailUrl}
              alt=""
              width={640}
              height={360}
              className="h-44 w-full rounded-[22px] object-cover"
            />
            <div className="mt-4 flex items-start justify-between gap-4">
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="neon-link text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]"
              >
                {video.title}
              </a>
              <TrendBadge trend={video.trend} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[color:var(--color-muted)]">Published</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {formatPublishedDate(video.publishedAt)}
                </p>
              </div>
              <div>
                <p className="text-[color:var(--color-muted)]">Duration</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {video.durationText}
                </p>
              </div>
              <div>
                <p className="text-[color:var(--color-muted)]">Views</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {formatInteger(video.views)}
                </p>
              </div>
              <div>
                <p className="text-[color:var(--color-muted)]">Views / day</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {formatCompactNumber(video.viewsPerDay)}
                </p>
              </div>
              <div>
                <p className="text-[color:var(--color-muted)]">Engagement</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {formatPercent(video.engagementRate)}
                </p>
              </div>
              <div>
                <p className="text-[color:var(--color-muted)]">Comments</p>
                <p className="mt-1 font-medium text-[color:var(--color-foreground)]">
                  {formatInteger(video.comments)}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
