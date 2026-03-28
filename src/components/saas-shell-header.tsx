import { BarChart3, ChevronRight, CreditCard } from "lucide-react";

export function SaasShellHeader({
  planLabel,
  statusLabel,
  onOpenCheckout,
}: {
  planLabel: string;
  statusLabel: string;
  onOpenCheckout: () => void;
}) {
  const navItems = [
    { label: "Overview", href: "#overview" },
    { label: "Saved Reports", href: "#saved-reports" },
    { label: "Weekly Tracking", href: "#weekly-tracking" },
    { label: "Billing", href: "#billing" },
  ];

  return (
    <header className="rounded-[32px] border border-[color:var(--color-border)] bg-white/88 px-5 py-4 shadow-[0_16px_45px_rgba(31,35,33,0.06)] sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-[color:var(--color-foreground)] p-2.5 text-[color:var(--color-background)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-muted)]">
                VidMetrics
              </p>
              <p className="text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Competitor Pulse
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 lg:ml-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-[color:var(--color-muted)] transition hover:bg-[rgba(16,120,105,0.08)] hover:text-[color:var(--color-accent)]"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-[color:var(--color-border)] bg-[rgba(255,252,246,0.92)] px-4 py-2 text-sm text-[color:var(--color-muted)]">
            <span className="font-semibold text-[color:var(--color-foreground)]">{planLabel}</span>
            <span className="mx-2 text-[rgba(31,35,33,0.25)]">&bull;</span>
            {statusLabel}
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-foreground)] px-4 py-2 text-sm font-semibold text-[color:var(--color-background)] transition hover:bg-[color:var(--color-accent)]"
          >
            <CreditCard className="h-4 w-4" />
            Pricing / Upgrade
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-full border border-[color:var(--color-border)] bg-white px-3 py-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(16,120,105,0.14)] text-sm font-semibold text-[color:var(--color-accent)]">
              AP
            </div>
            <div className="pr-2">
              <p className="text-sm font-semibold text-[color:var(--color-foreground)]">
                Agency PM
              </p>
              <p className="text-xs text-[color:var(--color-muted)]">Enterprise workspace</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
