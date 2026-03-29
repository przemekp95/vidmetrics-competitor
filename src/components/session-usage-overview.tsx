import { Activity, Download, FolderKanban, Sparkles } from "lucide-react";

type UsageCard = {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
};

export function SessionUsageOverview({
  analyzedChannels,
  exportCount,
  snapshotCount,
  planStatus,
}: {
  analyzedChannels: number;
  exportCount: number;
  snapshotCount: number;
  planStatus: string;
}) {
  const cards: UsageCard[] = [
    {
      label: "Plan status",
      value: planStatus,
      detail: "Current workspace entitlement shown to the client",
      icon: <Sparkles className="h-4 w-4" />,
      tone: "from-[rgba(86,250,255,0.18)] to-transparent",
    },
    {
      label: "Channels analyzed",
      value: analyzedChannels.toString(),
      detail: "Unique competitor channels reviewed this browser session",
      icon: <Activity className="h-4 w-4" />,
      tone: "from-[rgba(86,250,255,0.08)] to-transparent",
    },
    {
      label: "CSV exports",
      value: exportCount.toString(),
      detail: "Client-ready exports generated from the current shortlist",
      icon: <Download className="h-4 w-4" />,
      tone: "from-[rgba(255,99,216,0.14)] to-transparent",
    },
    {
      label: "Session reports",
      value: snapshotCount.toString(),
      detail: "Saved reports kept inside the active browser session",
      icon: <FolderKanban className="h-4 w-4" />,
      tone: "from-[rgba(140,99,255,0.14)] to-transparent",
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`neon-stat-card relative overflow-hidden rounded-[28px] p-5`}
        >
          <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.tone}`} />
          <div className="relative inline-flex rounded-full border border-[rgba(86,250,255,0.16)] bg-[rgba(8,15,31,0.84)] p-2 text-[color:var(--color-accent)]">
            {card.icon}
          </div>
          <p className="relative mt-4 text-sm font-medium text-[color:var(--color-muted)]">
            {card.label}
          </p>
          <p className="relative mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {card.value}
          </p>
          <p className="relative mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
            {card.detail}
          </p>
        </article>
      ))}
    </section>
  );
}
