import { ArrowUpRight, Sparkles } from "lucide-react";

export function UpgradePromptBanner({
  source,
  onOpenCheckout,
}: {
  source: "snapshot" | "export" | null;
  onOpenCheckout: () => void;
}) {
  if (!source) {
    return null;
  }

  const content =
    source === "snapshot"
      ? {
          eyebrow: "Saved report workflow",
          title: "Track weekly with Pro",
          description:
            "You saved a session snapshot. Upgrade the workspace to turn one-off saves into repeatable weekly reporting.",
        }
      : {
          eyebrow: "Team workflow",
          title: "Share reports with your team",
          description:
            "You exported a shortlist. Upgrade the workspace to route recurring report packs through seats, billing, and activation.",
        };

  return (
    <section className="rounded-[28px] border border-[rgba(16,120,105,0.2)] bg-[linear-gradient(135deg,rgba(16,120,105,0.12),rgba(255,255,255,0.94))] p-5 shadow-[0_18px_50px_rgba(31,35,33,0.06)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[color:var(--color-muted)]">
            {content.eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
            {content.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--color-muted)]">
            {content.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-foreground)] px-5 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)]"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade workspace
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
