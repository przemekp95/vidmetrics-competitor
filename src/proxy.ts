import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/reports(.*)",
  "/tracking(.*)",
  "/benchmarks(.*)",
  "/api/analyze(.*)",
  "/api/analysis-snapshots(.*)",
  "/api/upgrade-checkout(.*)",
  "/api/saved-reports(.*)",
  "/api/tracked-channels(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
}, {
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up",
  afterSignInUrl: "/",
  afterSignUpUrl: "/",
});

export const config = {
  matcher: [
    "/((?!api/checkout-return-state|checkout/return|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};
