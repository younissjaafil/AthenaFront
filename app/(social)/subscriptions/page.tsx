"use client";

import { Users, MoreHorizontal, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useVerifiedCreators } from "@/hooks/useCreators";

export default function SubscriptionsPage() {
  const { data: creators, isLoading } = useVerifiedCreators();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 h-14">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            SUBSCRIPTIONS
          </h1>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button className="flex-1 py-3 text-sm font-medium text-[#00AFF0] border-b-2 border-[#00AFF0]">
          Active
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          Expired
        </button>
        <button className="flex-1 py-3 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          All
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscriptions"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00AFF0] transition-shadow"
          />
        </div>
      </div>

      {/* Subscriptions List or Empty State */}
      {isLoading ? (
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No active subscriptions
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Subscribe to creators to access their exclusive content
          </p>
          <Link href="/explore">
            <button className="px-6 py-2.5 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
              Explore Creators
            </button>
          </Link>
        </div>
      )}

      {/* Suggested Creators */}
      {creators && creators.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Suggested Creators
          </h3>
          <div className="space-y-3">
            {creators.slice(0, 5).map((creator) => (
              <Link
                key={creator.id}
                href={`/u/${creator.profile?.handle || creator.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {creator.user?.profileImageUrl ? (
                  <Image
                    src={creator.user.profileImageUrl}
                    alt={creator.user.firstName || "Creator"}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                    {creator.user?.firstName?.[0] || "C"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white truncate">
                    {creator.user?.firstName || creator.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    @{creator.profile?.handle || creator.id.slice(0, 8)}
                  </p>
                </div>
                <button className="px-4 py-1.5 text-sm font-medium text-[#00AFF0] border border-[#00AFF0] rounded-full hover:bg-[#00AFF0]/10 transition-colors">
                  Follow
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
