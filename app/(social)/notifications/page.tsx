"use client";

import { Bell, Settings } from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export default function NotificationsPage() {
  const { data: currentUser } = useCurrentUser();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            NOTIFICATIONS
          </h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Empty State */}
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No notifications yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          When someone interacts with your content, you&apos;ll see it here.
        </p>
      </div>
    </div>
  );
}
