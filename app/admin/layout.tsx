"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 dark:bg-black text-white flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 dark:border-gray-950">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-brand-teal-400">
              Athena
            </Link>
            <span className="ml-2 text-xs font-semibold text-red-400 bg-red-900/30 px-2 py-0.5 rounded">
              Admin
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
              <p className="text-xs text-gray-400 truncate">admin@athena.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gray-50 dark:bg-black">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
