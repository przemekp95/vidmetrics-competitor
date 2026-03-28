import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-[32px] border border-[color:var(--color-border)] bg-white/92 p-6 shadow-[0_18px_50px_rgba(31,35,33,0.07)]">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-muted)]">
          VidMetrics
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[color:var(--color-foreground)]">
          Sign in
        </h1>
        <p className="mt-3 text-sm leading-6 text-[color:var(--color-muted)]">
          Access the protected workspace, Stripe sandbox checkout, and paid workflow activation.
        </p>
        <div className="mt-6 flex justify-center">
          <SignIn />
        </div>
      </section>
    </main>
  );
}
