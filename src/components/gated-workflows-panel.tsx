import { CalendarRange, ChevronRight, FolderKanban, Layers3, Lock, ShieldCheck } from "lucide-react";

import type { UpgradeCheckoutReadModel } from "@/application/read-models/upgrade-checkout-read-model";

type WorkflowCard = {
  id: string;
  title: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
};

export function GatedWorkflowsPanel({
  checkout,
  onOpenCheckout,
}: {
  checkout: UpgradeCheckoutReadModel | null;
  onOpenCheckout: () => void;
}) {
  const cards: WorkflowCard[] = [
    {
      id: "durable-reports",
      title: "Saved Reports",
      description: "Persist client-ready reports beyond the current browser session.",
      detail: "Promote snapshots into durable analyst assets with owners, context, and handoff-ready exports.",
      icon: <FolderKanban className="h-5 w-5" />,
    },
    {
      id: "weekly-tracking",
      title: "Weekly Tracking",
      description: "Track competitor momentum on a recurring cadence.",
      detail: "Pin channels for Monday refreshes, spot breakout uploads faster, and route updates into account review rituals.",
      icon: <CalendarRange className="h-5 w-5" />,
    },
    {
      id: "benchmarks",
      title: "Multi-channel Benchmarks",
      description: "Compare multiple creators inside a single commercial workflow.",
      detail: "Benchmark share of attention, publishing cadence, and engagement efficiency across a competitive set.",
      icon: <Layers3 className="h-5 w-5" />,
    },
  ];

  const isActivationPending = checkout?.status === "submitted";

  return (
    <section className="rounded-[32px] border border-[color:var(--color-border)] bg-white/90 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            Product workflow
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            Expand the demo beyond one-off analysis.
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[color:var(--color-muted)]">
            These surfaces sell the next step of the product: saved reports, recurring tracking,
            and account-level benchmarking powered by a checkout-style activation flow.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.92)] px-5 text-sm font-semibold text-[color:var(--color-foreground)] transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
        >
          {isActivationPending ? <ShieldCheck className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          {isActivationPending ? "View pending order" : "Upgrade to unlock"}
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
                  isActivationPending
                    ? "bg-[rgba(16,120,105,0.12)] text-[color:var(--color-accent)]"
                    : "bg-[rgba(31,35,33,0.08)] text-[color:var(--color-foreground-soft)]"
                }`}
              >
                {isActivationPending ? "Activation pending" : "Locked"}
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

            <button
              type="button"
              onClick={onOpenCheckout}
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--color-accent)] transition hover:opacity-80"
            >
              {isActivationPending ? "View billing" : "Upgrade workflow"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
