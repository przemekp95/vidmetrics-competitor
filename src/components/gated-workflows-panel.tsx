import Link from "next/link";
import { CalendarRange, ChevronRight, FolderKanban, Layers3, Lock, ShieldCheck } from "lucide-react";

type WorkflowCard = {
  id: string;
  title: string;
  description: string;
  detail: string;
  href: string;
  icon: React.ReactNode;
  isEnabled: boolean;
};

export function GatedWorkflowsPanel({
  canUseSavedReports,
  canUseWeeklyTracking,
  canUseBenchmarks,
  onOpenCheckout,
}: {
  canUseSavedReports: boolean;
  canUseWeeklyTracking: boolean;
  canUseBenchmarks: boolean;
  onOpenCheckout: () => void;
}) {
  const cards: WorkflowCard[] = [
    {
      id: "durable-reports",
      title: "Saved Reports",
      description: "Persist client-ready reports beyond the current browser session.",
      detail: "Durable account storage replaces temporary browser-session snapshots after billing activation.",
      href: "/reports",
      icon: <FolderKanban className="h-5 w-5" />,
      isEnabled: canUseSavedReports,
    },
    {
      id: "weekly-tracking",
      title: "Weekly Tracking",
      description: "Pin competitor channels and refresh them manually from the current workspace.",
      detail: "No cron automation yet. The MVP saves tracked channels and refreshes them on demand.",
      href: "/tracking",
      icon: <CalendarRange className="h-5 w-5" />,
      isEnabled: canUseWeeklyTracking,
    },
    {
      id: "benchmarks",
      title: "Multi-channel Benchmarks",
      description: "Compare up to three tracked channels or saved reports side by side.",
      detail: "The MVP benchmarks current summary metrics only, not historical time series.",
      href: "/benchmarks",
      icon: <Layers3 className="h-5 w-5" />,
      isEnabled: canUseBenchmarks,
    },
  ];
  const hasAnyPaidAccess = cards.some((card) => card.isEnabled);

  return (
    <section className="neon-panel neon-grid rounded-[34px] p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Product workflow</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
            Expand the analyzer into a paid workspace.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 neon-muted-copy">
            Paid surfaces stay locked until Stripe sandbox checkout reaches webhook-confirmed
            activation.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="neon-button-outline inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
        >
          {hasAnyPaidAccess ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {hasAnyPaidAccess ? "View billing state" : "Upgrade to unlock"}
        </button>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            id={card.id}
            className="neon-shell-soft rounded-[28px] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex rounded-2xl border border-[rgba(86,250,255,0.16)] bg-[rgba(8,15,31,0.84)] p-3 text-[color:var(--color-accent)]">
                {card.icon}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  card.isEnabled
                    ? "neon-badge"
                    : "border border-[rgba(112,132,191,0.18)] bg-[rgba(8,15,31,0.7)] text-[color:var(--color-foreground-soft)]"
                }`}
              >
                {card.isEnabled ? "Unlocked" : "Locked"}
              </span>
            </div>

            <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
              {card.title}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
              {card.description}
            </p>
            <p className="mt-4 text-sm leading-6 text-[color:var(--color-foreground-soft)]">
              {card.detail}
            </p>

            {card.isEnabled ? (
              <Link
                href={card.href}
                className="neon-link mt-5 inline-flex items-center gap-2 text-sm font-semibold"
              >
                Open workflow
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpenCheckout}
                className="neon-link mt-5 inline-flex items-center gap-2 text-sm font-semibold"
              >
                Upgrade workflow
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
