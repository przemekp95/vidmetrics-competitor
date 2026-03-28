import Link from "next/link";

import { LegalLinks } from "@/components/legal-links";

export function LegalPageShell({
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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
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
            className="inline-flex items-center rounded-full border border-(--color-border) bg-white px-4 py-2 text-sm font-semibold text-(--color-foreground) transition hover:border-(--color-accent) hover:text-(--color-accent)"
          >
            Back to workspace
          </Link>
        </div>
      </header>

      <section className="rounded-4xl border border-[rgba(211,141,28,0.24)] bg-[rgba(255,250,242,0.92)] px-6 py-5 text-sm leading-6 text-(--color-foreground-soft) shadow-[0_12px_30px_rgba(31,35,33,0.04)] sm:px-8">
        <p className="font-semibold uppercase tracking-[0.16em] text-(--color-sun-deep)">
          Demo legal template
        </p>
        <p className="mt-3">
          This deployment includes placeholder legal copy for MVP review. Replace operator details,
          retention periods, lawful basis wording, accessibility compliance evidence, and
          jurisdiction-specific clauses before any production launch. This content is not legal
          advice.
        </p>
      </section>

      <section className="rounded-4xl border border-(--color-border) bg-white/90 px-6 py-7 shadow-[0_18px_50px_rgba(31,35,33,0.07)] sm:px-8">
        <div className="grid gap-8 text-(--color-foreground) [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-(--color-foreground) [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-(--color-foreground) [&_p]:text-base [&_p]:leading-7 [&_p]:text-(--color-foreground-soft) [&_ul]:grid [&_ul]:gap-3 [&_ul]:pl-5 [&_li]:leading-7 [&_li]:text-(--color-foreground-soft)">
          {children}
        </div>
      </section>

      <footer className="flex flex-col gap-3 pb-8 text-sm text-(--color-muted)">
        <p>
          VidMetrics Competitor Pulse is currently presented as a signed-in B2B MVP with Stripe
          sandbox billing, webhook-gated activation, and unfinished production legal/compliance
          details.
        </p>
        <LegalLinks linkClassName="font-medium text-(--color-foreground)" />
      </footer>
    </main>
  );
}
