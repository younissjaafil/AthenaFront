import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Protected routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/home(.*)",
  "/notifications(.*)",
  "/messages(.*)",
  "/collections(.*)",
  "/subscriptions(.*)",
  "/profile(.*)",
  "/student(.*)",
  "/creator(.*)",
  "/admin(.*)",
  "/onboarding(.*)",
]);

// Auth routes (sign-in/sign-up)
const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  // Auth routes (sign-in/sign-up) - don't protect
  if (isAuthRoute(request)) {
    return;
  }

  // Protected routes - require authentication
  if (isProtectedRoute(request)) {
    await auth.protect();
    return;
  }

  // Everything else is public (/, /explore, /[username], /api/webhooks, etc.)
  return;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
