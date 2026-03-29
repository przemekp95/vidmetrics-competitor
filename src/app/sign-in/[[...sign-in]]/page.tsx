import { SignIn } from "@clerk/nextjs";

import { clerkAuthAppearance } from "@/lib/auth/clerk-auth-appearance";

export default function SignInPage() {
  return (
    <main className="auth-shell relative z-10 mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="neon-panel neon-grid w-full max-w-md rounded-[34px] p-6">
        <p className="eyebrow">
          VidMetrics
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight neon-title">
          Sign in
        </h1>
        <p className="mt-3 text-sm leading-6 neon-muted-copy">
          Access the protected workspace, Stripe sandbox checkout, and paid workflow activation.
        </p>
        <div className="mt-6 flex justify-center">
          <SignIn appearance={clerkAuthAppearance} />
        </div>
      </section>
    </main>
  );
}
