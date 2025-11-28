"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { RoleGuard } from "@/components/auth/RoleRedirector";

const studentNav = [
  { name: "Dashboard", href: "/student/dashboard", icon: "📊" },
  { name: "My Chats", href: "/student/chats", icon: "💬" },
  { name: "Sessions", href: "/student/sessions", icon: "📅" },
  { name: "Settings", href: "/student/settings", icon: "⚙️" },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    // Temporarily disabled for testing - uncomment when backend is ready
    // <RoleGuard allowedRoles={["student", "creator", "admin"]}>
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 border-r border-border-light dark:border-gray-800 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-gray-800">
          <Link
            href="/"
            className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
          >
            Athena
          </Link>
          <ThemeToggle />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {studentNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
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
            <div className="w-8 h-8 rounded-full bg-brand-purple-100 dark:bg-brand-purple-950 flex items-center justify-center">
              <span className="text-sm font-medium text-brand-purple-700 dark:text-brand-purple-400">
                S
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                Student
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                student@athena.ai
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background-light dark:bg-gray-950">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
    // </RoleGuard>
  );
}
