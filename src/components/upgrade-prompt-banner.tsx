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
    <section className="neon-panel neon-grid rounded-[30px] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight neon-title">
            {content.title}
          </h2>
          <p className="mt-3 text-sm leading-6 neon-muted-copy">
            {content.description}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenCheckout}
          className="neon-button inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade workspace
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
