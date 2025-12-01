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
 * 1. New user -> /explore
 * 2. Creator (not yet completed onboarding) -> /creator/onboarding
 * 3. Creator working -> /creator/dashboard
 * 4. Default -> /explore
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

    // 1. Creator who hasn't completed onboarding - needs creator onboarding
    if (user.isCreator && !user.hasCompletedOnboarding) {
      if (!pathname.startsWith("/creator/onboarding")) {
        router.replace("/creator/onboarding");
      }
      return;
    }

    // 2. Creator on home page - redirect to creator dashboard
    if (user.isCreator && pathname === "/") {
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
