"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCurrentUser, useEnableCreatorPower } from "@/hooks/useCurrentUser";
import {
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  Plus,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const socialNav = [
  { name: "Home", href: "/", icon: Home },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Collections", href: "/collections", icon: Bookmark },
  { name: "Subscriptions", href: "/subscriptions", icon: Users },
  { name: "My profile", href: "/profile", icon: User },
];

export default function SocialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: currentUser } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const enableCreatorPower = useEnableCreatorPower();

  const isCreator = currentUser?.isCreator || currentUser?.isAdmin;

  const handleBecomeCreator = async () => {
    try {
      await enableCreatorPower.mutateAsync({
        title: "Creator",
        bio: "New creator on Athena",
        expertiseLevel: "beginner",
      });
    } catch (error) {
      console.error("Failed to become creator:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <Link
          href="/"
          className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
        >
          Athena
        </Link>
        <ThemeToggle />
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-60 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen lg:sticky lg:top-0 transform transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Close button for mobile */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400">
              Athena
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Link
              href="/"
              className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
            >
              Athena
            </Link>
            <ThemeToggle />
          </div>

          {/* User Info - Desktop */}
          <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentUser?.firstName || currentUser?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{currentUser?.username || "user"}
                  </p>
                </div>
                {isCreator && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-700 rounded-full">
                    Creator
                  </span>
                )}
              </div>
              {!isCreator && (
                <button
                  onClick={handleBecomeCreator}
                  disabled={enableCreatorPower.isPending}
                  className="flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {enableCreatorPower.isPending
                      ? "Activating..."
                      : "Become Creator"}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {socialNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center gap-4 px-6 py-3 text-[15px] transition-colors",
                        isActive
                          ? "text-gray-900 dark:text-white font-semibold"
                          : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                      )}
                    >
                      <item.icon
                        className="w-5 h-5"
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Dashboard Quick Links */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <Link
              href="/student/dashboard"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-xl transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Student Dashboard</span>
            </Link>
            {isCreator && (
              <Link
                href="/creator/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-950 rounded-xl transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>Creator Studio</span>
              </Link>
            )}
          </div>

          {/* New Post Button */}
          {isCreator && (
            <div className="p-4 pt-0">
              <Link
                href="/creator/posts/new"
                onClick={() => setSidebarOpen(false)}
              >
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
                  <Plus className="w-5 h-5" />
                  NEW POST
                </button>
              </Link>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 pt-14 lg:pt-0">{children}</main>
      </div>
    </div>
  );
}
