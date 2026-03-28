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
    <section className="rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Product workflow
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Expand the analyzer into a paid workspace.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--color-muted)]">
            Paid surfaces stay locked until Stripe sandbox checkout reaches webhook-confirmed
            activation.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-(--border-interactive) bg-[rgba(255,252,246,0.92)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
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
            className="rounded-[28px] border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.76)] p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="inline-flex rounded-2xl bg-white/80 p-3 text-[color:var(--color-accent)]">
                {card.icon}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  card.isEnabled
                    ? "bg-[rgba(16,120,105,0.12)] text-[color:var(--color-accent)]"
                    : "bg-[rgba(31,35,33,0.08)] text-[color:var(--color-foreground-soft)]"
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
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:opacity-80"
              >
                Open workflow
                <ChevronRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                type="button"
                onClick={onOpenCheckout}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] underline decoration-[color:var(--color-accent)] decoration-2 underline-offset-3 transition hover:opacity-80"
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
