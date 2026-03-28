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
      tone: "bg-[linear-gradient(135deg,rgba(16,120,105,0.16),rgba(255,255,255,0.95))]",
    },
    {
      label: "Channels analyzed",
      value: analyzedChannels.toString(),
      detail: "Unique competitor channels reviewed this browser session",
      icon: <Activity className="h-4 w-4" />,
      tone: "bg-white/95",
    },
    {
      label: "CSV exports",
      value: exportCount.toString(),
      detail: "Client-ready exports generated from the current shortlist",
      icon: <Download className="h-4 w-4" />,
      tone: "bg-[linear-gradient(135deg,rgba(255,194,102,0.2),rgba(255,255,255,0.95))]",
    },
    {
      label: "Session reports",
      value: snapshotCount.toString(),
      detail: "Saved reports kept inside the active browser session",
      icon: <FolderKanban className="h-4 w-4" />,
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
          <div className="inline-flex rounded-full bg-white/80 p-2 text-[color:var(--color-accent)]">
            {card.icon}
          </div>
          <p className="mt-4 text-sm font-medium text-[color:var(--color-muted)]">{card.label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {card.value}
          </p>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">{card.detail}</p>
        </article>
      ))}
    </section>
  );
}
