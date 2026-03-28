import Link from "next/link";

import { LegalLinks } from "@/components/legal-links";

export function CommercialFeaturePageShell({
  eyebrow,
  title,
  summary,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-4xl border border-(--color-border) bg-white/88 px-6 py-6 shadow-[0_16px_45px_rgba(31,35,33,0.06)] sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-(--color-muted)">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-(--color-foreground)">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-(--color-muted)">{summary}</p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-(--border-interactive) bg-white px-4 py-2 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            Back to workspace
          </Link>
        </div>
      </header>

      {children}

      <footer className="flex flex-col gap-3 pb-8 text-sm text-(--color-muted)">
        <p>
          These pages reflect the same authenticated B2B MVP account state used in the main
          workspace.
        </p>
        <LegalLinks linkClassName="font-medium text-(--color-foreground)" />
      </footer>
    </main>
  );
}
