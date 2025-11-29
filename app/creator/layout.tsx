"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleGuard } from "@/components/auth/RoleRedirector";
import { Menu, X } from "lucide-react";

const creatorNav = [
  { name: "Dashboard", href: "/creator/dashboard", icon: "📊" },
  { name: "My Agents", href: "/creator/agents", icon: "🤖" },
  { name: "Documents", href: "/creator/documents", icon: "📄" },
  { name: "Sessions", href: "/creator/sessions", icon: "📅" },
  { name: "Analytics", href: "/creator/analytics", icon: "📈" },
  { name: "Settings", href: "/creator/settings", icon: "⚙️" },
];

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={["creator", "admin"]}>
      <div className="min-h-screen flex">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-b border-border-light dark:border-gray-800 h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center">
            <span className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400">
              Athena
            </span>
            <span className="ml-2 text-xs font-semibold text-brand-teal-500 bg-brand-teal-50 dark:bg-brand-teal-950 dark:text-brand-teal-400 px-2 py-0.5 rounded">
              Creator
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-border-light dark:border-gray-800 flex flex-col transform transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-border-light dark:border-gray-800">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
              >
                Athena
              </Link>
              <span className="ml-2 text-xs font-semibold text-brand-teal-500 bg-brand-teal-50 dark:bg-brand-teal-950 dark:text-brand-teal-400 px-2 py-0.5 rounded">
                Creator
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            {/* Theme toggle for desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {creatorNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-purple-50 text-brand-purple-700 dark:bg-brand-purple-950 dark:text-brand-purple-400"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-border-light dark:border-gray-800">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-brand-teal-100 dark:bg-brand-teal-950 flex items-center justify-center">
                <span className="text-sm font-medium text-brand-teal-700 dark:text-brand-teal-400">
                  C
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  Creator
                </p>
                <p className="text-xs text-gray-500 truncate">
                  creator@athena.ai
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background-light dark:bg-gray-950 pt-14 md:pt-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
