"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border-light flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border-light">
          <Link href="/" className="text-xl font-bold text-brand-purple-600">
            Athena
          </Link>
          <span className="ml-2 text-xs font-semibold text-brand-teal-500 bg-brand-teal-50 px-2 py-0.5 rounded">
            Creator
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {creatorNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-purple-50 text-brand-purple-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border-light">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-brand-teal-100 flex items-center justify-center">
              <span className="text-sm font-medium text-brand-teal-700">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
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
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
