"use client";

import { MessageSquare, Search, Edit } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100vh-56px)] lg:h-screen">
      {/* Messages List */}
      <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              MESSAGES
            </h1>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
              <Edit className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </header>

        {/* Search */}
        <div className="p-3 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages"
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00AFF0] transition-shadow"
            />
          </div>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Start a conversation with a creator
            </p>
          </div>
        </div>
      </div>

      {/* Message Content - Hidden on mobile */}
      <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    </div>
  );
}
