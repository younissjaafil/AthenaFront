"use client";

import { motion } from "framer-motion";
import { Star, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useVerifiedCreators } from "@/hooks/useCreators";

export function SuggestedCreators() {
  const { data: creators, isLoading } = useVerifiedCreators();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"
          />
        ))}
      </div>
    );
  }

  const topCreators = creators?.slice(0, 5) || [];

  if (topCreators.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Suggested Creators
        </h3>
      </div>

      <div className="space-y-3">
        {topCreators.map((creator) => {
          const name =
            creator.user?.firstName && creator.user?.lastName
              ? `${creator.user.firstName} ${creator.user.lastName}`
              : creator.title;

          return (
            <Link
              key={creator.id}
              href={`/u/${creator.profile?.handle || creator.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {creator.user?.profileImageUrl ? (
                  <img
                    src={creator.user.profileImageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                    {name?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {name}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {creator.averageRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {creator.averageRating.toFixed(1)}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {creator.totalSessions} sessions
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/explore"
        className="block mt-4 text-center text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400"
      >
        See all creators →
      </Link>
    </div>
  );
}
