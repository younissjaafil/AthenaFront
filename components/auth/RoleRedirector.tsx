"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Component that redirects users to their appropriate dashboard based on roles.
 * Priority: Admin > Creator > Student
 *
 * Usage: Place this component in layouts or pages where you want automatic redirection
 * after sign-in (e.g., in the student/creator/admin layout to redirect if wrong role)
 */
export function RoleRedirector() {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading || !user) return;

    // Redirect based on role priority
    if (user.isAdmin) {
      router.replace("/admin/dashboard");
    } else if (user.isCreator) {
      router.replace("/creator/dashboard");
    } else if (user.isStudent) {
      router.replace("/student/dashboard");
    }
  }, [user, isLoading, router]);

  // Show loading state while determining role
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Higher-order component that wraps a page and ensures user is redirected
 * to their correct dashboard if they're on the wrong route.
 *
 * @param allowedRoles - Array of roles allowed to access this page
 */
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "creator" | "student")[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    if (isLoading || !user) return;

    // Check if user has one of the allowed roles
    const hasAccess =
      (allowedRoles.includes("admin") && user.isAdmin) ||
      (allowedRoles.includes("creator") && user.isCreator) ||
      (allowedRoles.includes("student") && user.isStudent);

    if (!hasAccess) {
      // Redirect to user's correct dashboard
      if (user.isAdmin) {
        router.replace("/admin/dashboard");
      } else if (user.isCreator) {
        router.replace("/creator/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  // Show loading state while checking permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Verifying permissions...
        </div>
      </div>
    );
  }

  // Show nothing if user doesn't have access (they'll be redirected)
  if (!user) return null;

  const hasAccess =
    (allowedRoles.includes("admin") && user.isAdmin) ||
    (allowedRoles.includes("creator") && user.isCreator) ||
    (allowedRoles.includes("student") && user.isStudent);

  if (!hasAccess) return null;

  return <>{children}</>;
}
