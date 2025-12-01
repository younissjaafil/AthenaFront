"use client";

import { Bookmark, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function CollectionsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            COLLECTIONS
          </h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button className="flex-1 py-3 text-sm font-medium text-[#00AFF0] border-b-2 border-[#00AFF0]">
          Bookmarks
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Lists
        </button>
      </div>

      {/* Empty State */}
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bookmark className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No bookmarks yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Save posts you want to revisit later
        </p>
        <Link href="/">
          <button className="px-6 py-2.5 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
            Browse Feed
          </button>
        </Link>
      </div>
    </div>
  );
}
