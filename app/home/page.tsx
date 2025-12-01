"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bell,
  MessageSquare,
  Users,
  Compass,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useHomeFeed, useDiscoverFeed, Post } from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { CreatePostForm, PostCard, SuggestedCreators } from "@/components/feed";
import { SmartRouter } from "@/components/auth";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/subscriptions", label: "Subscriptions", icon: Users },
  { href: "/explore", label: "Explore", icon: Compass },
];

export default function HomePage() {
  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const pathname = usePathname();
  const [feedType, setFeedType] = useState<"following" | "discover">(
    "following"
  );
  const [page, setPage] = useState(1);

  const { data: homeFeedData, isLoading: homeLoading } = useHomeFeed(page, 20);
  const { data: discoverFeedData, isLoading: discoverLoading } =
    useDiscoverFeed(page, 20);

  const feedData = feedType === "following" ? homeFeedData : discoverFeedData;
  const isLoading = feedType === "following" ? homeLoading : discoverLoading;

  const posts: Post[] = feedData?.posts || [];
  const hasMore = feedData?.hasMore || false;

  const isCreator = currentUser?.isCreator === true;

  return (
    <SmartRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 py-6">
            {/* Left Sidebar - Navigation */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20">
                <nav className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <ul className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                              isActive
                                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Quick Actions for Creators */}
                {isCreator && (
                  <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Creator Tools
                    </h3>
                    <div className="space-y-2">
                      <Link href="/creator/dashboard">
                        <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Dashboard
                        </button>
                      </Link>
                      <Link href="/creator/sessions">
                        <button className="w-full flex items-center justify-start px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Users className="w-4 h-4 mr-2" />
                          Sessions
                        </button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Feed */}
            <main className="flex-1 min-w-0 max-w-2xl">
              {/* Feed Type Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFeedType("following")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        feedType === "following"
                          ? "bg-purple-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      Following
                    </button>
                    <button
                      onClick={() => setFeedType("discover")}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center ${
                        feedType === "discover"
                          ? "bg-purple-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <Compass className="w-4 h-4 mr-2" />
                      Discover
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Post Form (only for creators) */}
              {isCreator && (
                <div className="mb-4">
                  <CreatePostForm />
                </div>
              )}

              {/* Posts Feed */}
              <div className="space-y-4">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      </div>
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg mt-4" />
                    </div>
                  ))
                ) : posts.length === 0 ? (
                  // Empty state
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Compass className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feedType === "following"
                        ? "No posts from creators you follow"
                        : "No posts to discover yet"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {feedType === "following"
                        ? "Follow some creators to see their posts here"
                        : "Be the first to post something!"}
                    </p>
                    {feedType === "following" && (
                      <Link href="/explore">
                        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center mx-auto">
                          <Compass className="w-4 h-4 mr-2" />
                          Explore Creators
                        </button>
                      </Link>
                    )}
                  </div>
                ) : (
                  // Posts list
                  <AnimatePresence mode="popLayout">
                    {posts.map((post) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                      >
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </main>

            {/* Right Sidebar - Suggestions */}
            <aside className="hidden xl:block w-80 flex-shrink-0">
              <div className="sticky top-20 space-y-4">
                <SuggestedCreators />

                {/* Trending Topics */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Trending Topics
                  </h3>
                  <div className="space-y-3">
                    {[
                      "AI Development",
                      "Web3",
                      "Machine Learning",
                      "Design",
                    ].map((topic) => (
                      <Link
                        key={topic}
                        href={`/explore?topic=${encodeURIComponent(topic)}`}
                        className="block p-2 -mx-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          #{topic.replace(/\s+/g, "")}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.floor(Math.random() * 100) + 10} posts
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Footer Links */}
                <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <Link href="/about" className="hover:underline">
                      About
                    </Link>
                    <Link href="/help" className="hover:underline">
                      Help
                    </Link>
                    <Link href="/privacy" className="hover:underline">
                      Privacy
                    </Link>
                    <Link href="/terms" className="hover:underline">
                      Terms
                    </Link>
                  </div>
                  <p className="mt-2">© 2024 Athena</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </SmartRouter>
  );
}
