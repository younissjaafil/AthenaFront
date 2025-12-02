"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";

/**
 * Component that redirects users to their appropriate dashboard based on roles.
 * Priority: Admin > Creator > User (student Studio)
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
    } else {
      // Everyone goes to student/learning dashboard
      router.replace("/student/dashboard");
    }
  }, [user, isLoading, router]);

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
 * Guard component that ensures user has required role to access a page.
 * Roles: 'admin', 'creator', 'user' (everyone is a user)
 */
interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "creator" | "user")[];
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
      allowedRoles.includes("user"); // Everyone is a user

    if (!hasAccess) {
      // Redirect to appropriate dashboard
      if (user.isAdmin) {
        router.replace("/admin/dashboard");
      } else if (user.isCreator) {
        router.replace("/creator/dashboard");
      } else {
        router.replace("/student/dashboard");
      }
    }
  }, [user, isLoading, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            Verifying permissions...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Please sign in to access this page
          </p>
          <Link
            href="/sign-in"
            className="text-brand-purple-600 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess =
    (allowedRoles.includes("admin") && user.isAdmin) ||
    (allowedRoles.includes("creator") && user.isCreator) ||
    allowedRoles.includes("user");

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
