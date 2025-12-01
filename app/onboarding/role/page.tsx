"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * Role selection page - now deprecated.
 * Users go directly to explore and can become creators from their profile.
 * This page redirects to /explore for backwards compatibility.
 */
export default function OnboardingRolePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/explore");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
