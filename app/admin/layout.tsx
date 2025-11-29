"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleGuard } from "@/components/auth/RoleRedirector";
import { Menu, X } from "lucide-react";

const adminNav = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "📊" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Agents", href: "/admin/agents", icon: "🤖" },
  { name: "Analytics", href: "/admin/analytics", icon: "📈" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <div className="min-h-screen flex">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 z-40 md:hidden bg-gray-900 dark:bg-black border-b border-gray-800 h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            <Menu className="w-6 h-6 text-gray-300" />
          </button>
          <div className="flex items-center">
            <span className="text-xl font-bold text-brand-teal-400">
              Athena
            </span>
            <span className="ml-2 text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
              Admin
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
            "fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-black text-white flex flex-col transform transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          {/* Logo */}
          <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b border-gray-800 dark:border-gray-950">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-brand-teal-400">
                Athena
              </Link>
              <span className="ml-2 text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-800 md:hidden"
            >
              <X className="w-5 h-5 text-gray-300" />
            </button>
            {/* Theme toggle for desktop */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-teal-500/20 text-brand-teal-400"
                      : "text-gray-300 hover:bg-gray-800 dark:hover:bg-gray-950"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-800 dark:border-gray-950">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center">
                <span className="text-sm font-medium text-red-400">A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Admin</p>
                <p className="text-xs text-gray-400 truncate">
                  admin@athena.ai
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50 dark:bg-black pt-14 md:pt-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">{children}</div>
        </main>
      </div>
    </RoleGuard>
  );
}
