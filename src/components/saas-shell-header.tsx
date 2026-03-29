"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { BarChart3, ChevronRight, CreditCard } from "lucide-react";

export function SaasShellHeader({
  planLabel,
  statusLabel,
  canUseSavedReports,
  canUseWeeklyTracking,
  canUseBenchmarks,
  onOpenCheckout,
}: {
  planLabel: string;
  statusLabel: string;
  canUseSavedReports: boolean;
  canUseWeeklyTracking: boolean;
  canUseBenchmarks: boolean;
  onOpenCheckout: () => void;
}) {
  const navItems = [
    { label: "Overview", href: "#overview" },
    { label: "Session Snapshots", href: "#session-snapshots" },
    { label: "Saved Reports", href: canUseSavedReports ? "/reports" : "#durable-reports" },
    { label: "Weekly Tracking", href: canUseWeeklyTracking ? "/tracking" : "#weekly-tracking" },
    { label: "Benchmarks", href: canUseBenchmarks ? "/benchmarks" : "#benchmarks" },
    { label: "Billing", href: "#billing" },
  ];

  return (
    <header className="neon-shell neon-grid rounded-[34px] px-5 py-4 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-[rgba(86,250,255,0.22)] bg-[rgba(8,15,31,0.84)] p-2.5 text-[color:var(--color-accent)] shadow-[0_12px_28px_rgba(86,250,255,0.12)]">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="eyebrow text-[11px]">
                VidMetrics
              </p>
              <p className="text-lg font-semibold tracking-tight text-[color:var(--color-foreground)]">
                Competitor Pulse
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 lg:ml-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-transparent px-3 py-2 text-sm font-medium text-[color:var(--color-muted)] transition hover:border-[rgba(86,250,255,0.18)] hover:bg-[rgba(86,250,255,0.08)] hover:text-[color:var(--color-foreground)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="neon-chip rounded-full px-4 py-2 text-sm">
            <span className="font-semibold text-[color:var(--color-foreground)]">{planLabel}</span>
            <span className="mx-2 text-[rgba(142,160,201,0.45)]">&bull;</span>
            {statusLabel}
          </div>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="neon-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <CreditCard className="h-4 w-4" />
            Pricing / Upgrade
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="neon-chip rounded-full px-3 py-2">
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
