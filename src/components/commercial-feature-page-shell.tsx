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
    <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="neon-panel neon-grid rounded-[34px] px-6 py-7 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight neon-title">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 neon-muted-copy">{summary}</p>
          </div>

          <Link
            href="/"
            className="neon-button-outline inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold"
          >
            Back to workspace
          </Link>
        </div>
      </header>

      {children}

      <footer className="flex flex-col gap-3 pb-8 text-sm neon-muted-copy">
        <p>
          These pages reflect the same authenticated B2B MVP account state used in the main
          workspace.
        </p>
        <LegalLinks linkClassName="font-medium text-(--color-foreground)" />
      </footer>
    </main>
  );
}
