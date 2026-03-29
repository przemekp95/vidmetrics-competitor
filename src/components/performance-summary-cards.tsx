import type { ChannelAnalysisReadModel } from "@/application/read-models/analysis-read-model";
import { formatCompactNumber, formatPercent } from "@/lib/formatters";

export function PerformanceSummaryCards({
  analysis,
}: {
  analysis: ChannelAnalysisReadModel;
}) {
  const cards = [
    {
      label: "Uploads This Month",
      value: analysis.summary.uploadCount.toString(),
      detail: `${analysis.window.label} window`,
      tone: "from-[rgba(86,250,255,0.08)] to-transparent",
    },
    {
      label: "Average View Velocity",
      value: `${formatCompactNumber(analysis.summary.averageViewsPerDay)}/day`,
      detail: "Calculated from public view counts",
      tone: "from-[rgba(86,250,255,0.16)] to-transparent",
    },
    {
      label: "Average Engagement",
      value: formatPercent(analysis.summary.averageEngagementRate),
      detail: "Likes + comments divided by views",
      tone: "from-[rgba(255,99,216,0.14)] to-transparent",
    },
    {
      label: "Top Performer",
      value: analysis.summary.topPerformer
        ? analysis.summary.topPerformer.title
        : "No videos this month",
      detail: analysis.summary.topPerformer
        ? `${formatCompactNumber(analysis.summary.topPerformer.viewsPerDay)}/day`
        : "No current-month uploads found",
      tone: "from-[rgba(140,99,255,0.18)] to-transparent",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className="neon-stat-card relative overflow-hidden rounded-[28px] p-5"
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.tone}`} />
          <p className="relative text-sm font-medium text-[color:var(--color-muted)]">
            {card.label}
          </p>
          <p className="relative mt-3 text-balance text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {card.value}
          </p>
          <p className="relative mt-2 text-sm text-[color:var(--color-muted)]">
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}
