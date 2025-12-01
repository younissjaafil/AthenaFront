"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Loader2 } from "lucide-react";

interface SmartRouterProps {
  children: React.ReactNode;
}

/**
 * SmartRouter handles intelligent routing based on user onboarding state.
 *
 * Flow:
 * 1. New user (no intent selected) -> /onboarding/intent
 * 2. Learner (no discovery completed) -> /explore
 * 3. Creator intent (not yet creator) -> /creator/onboarding
 * 4. Creator working -> /creator/dashboard
 * 5. Has follows -> /home
 * 6. Default -> /explore
 */
export function SmartRouter({ children }: SmartRouterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { data: user, isLoading: userLoading } = useCurrentUser();

  useEffect(() => {
    // Don't redirect while loading
    if (!authLoaded || (isSignedIn && userLoading)) return;

    // Not signed in - let Clerk handle it
    if (!isSignedIn) return;

    // No user data yet
    if (!user) return;

    // Skip routing for these paths (let them be accessed normally)
    const skipPaths = ["/onboarding", "/sign-in", "/sign-up", "/api"];
    if (skipPaths.some((p) => pathname.startsWith(p))) return;

    // Also skip for public profile pages
    if (pathname.startsWith("/u/")) return;

    // 1. New user - needs to select intent
    if (user.needsIntentSelection) {
      if (pathname !== "/onboarding/intent") {
        router.replace("/onboarding/intent");
      }
      return;
    }

    // 2. Creator intent but not yet a creator - needs creator onboarding
    if (user.needsCreatorOnboarding) {
      if (!pathname.startsWith("/creator/onboarding")) {
        router.replace("/creator/onboarding");
      }
      return;
    }

    // 3. Learner who hasn't completed discovery - send to explore
    if (user.needsDiscovery) {
      // Allow /explore but redirect from /home
      if (pathname === "/home") {
        router.replace("/explore");
      }
      return;
    }

    // 4. If user is on a "cold" page and has data, suggest proper destination
    // (Don't force redirect, just allow access)

    // 5. Creator accessing home should be fine, but check last activity
    if (
      user.isCreator &&
      pathname === "/" &&
      user.lastActivityContext === "creator-dashboard"
    ) {
      router.replace("/creator/dashboard");
      return;
    }
  }, [authLoaded, isSignedIn, user, userLoading, pathname, router]);

  // Show loading state while determining route
  if (!authLoaded || (isSignedIn && userLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
