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
      tone: "bg-white/95",
    },
    {
      label: "Average View Velocity",
      value: `${formatCompactNumber(analysis.summary.averageViewsPerDay)}/day`,
      detail: "Calculated from public view counts",
      tone: "bg-[linear-gradient(135deg,rgba(16,120,105,0.14),rgba(255,255,255,0.95))]",
    },
    {
      label: "Average Engagement",
      value: formatPercent(analysis.summary.averageEngagementRate),
      detail: "Likes + comments divided by views",
      tone: "bg-[linear-gradient(135deg,rgba(255,194,102,0.18),rgba(255,255,255,0.95))]",
    },
    {
      label: "Top Performer",
      value: analysis.summary.topPerformer
        ? analysis.summary.topPerformer.title
        : "No videos this month",
      detail: analysis.summary.topPerformer
        ? `${formatCompactNumber(analysis.summary.topPerformer.viewsPerDay)}/day`
        : "No current-month uploads found",
      tone: "bg-[linear-gradient(135deg,rgba(31,35,33,0.08),rgba(255,255,255,0.95))]",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`rounded-[28px] border border-[color:var(--color-border)] p-5 shadow-[0_18px_50px_rgba(31,35,33,0.07)] ${card.tone}`}
        >
          <p className="text-sm font-medium text-[color:var(--color-muted)]">{card.label}</p>
          <p className="mt-3 text-balance text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {card.value}
          </p>
          <p className="mt-2 text-sm text-[color:var(--color-muted)]">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
