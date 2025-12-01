"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  MoreHorizontal,
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Pencil,
  X,
  ImageIcon,
  AlignLeft,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useHomeFeed, useDiscoverFeed, Post } from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PostCard } from "@/components/feed";
import { SmartRouter } from "@/components/auth";
import { useVerifiedCreators } from "@/hooks/useCreators";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/collections", label: "Collections", icon: Bookmark },
  { href: "/subscriptions", label: "Subscriptions", icon: Users },
  { href: "/profile", label: "My profile", icon: User },
  { href: "#", label: "More", icon: MoreHorizontal },
];

export default function HomePage() {
  const { data: currentUser } = useCurrentUser();
  const pathname = usePathname();
  const [feedFilter, setFeedFilter] = useState<"all" | "subscribed">("all");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: homeFeedData, isLoading: homeLoading } = useHomeFeed(page, 20);
  const { data: discoverFeedData, isLoading: discoverLoading } =
    useDiscoverFeed(page, 20);

  const feedData =
    feedFilter === "subscribed" ? homeFeedData : discoverFeedData;
  const isLoading = feedFilter === "subscribed" ? homeLoading : discoverLoading;

  const posts: Post[] = feedData?.posts || [];
  const hasMore = feedData?.hasMore || false;

  return (
    <SmartRouter>
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <div className="flex">
          {/* Left Sidebar - Fixed */}
          <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800">
            {/* User Avatar */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                {currentUser?.profileImageUrl ? (
                  <Image
                    src={currentUser.profileImageUrl}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold">
                    {currentUser?.firstName?.[0] || "U"}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-2">
              <ul className="space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-4 px-6 py-3 text-[15px] transition-colors ${
                          isActive
                            ? "text-gray-900 dark:text-white font-semibold"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      >
                        <item.icon
                          className="w-5 h-5"
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* New Post Button */}
            <div className="p-4">
              <Link href="/creator/post/new">
                <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
                  <Plus className="w-5 h-5" />
                  NEW POST
                </button>
              </Link>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between px-4 h-14">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  HOME
                </h1>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </header>

            <div className="max-w-2xl mx-auto">
              {/* Compose Box */}
              <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-start gap-3">
                  {currentUser?.profileImageUrl ? (
                    <Image
                      src={currentUser.profileImageUrl}
                      alt="Profile"
                      width={40}
                      height={40}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {currentUser?.firstName?.[0] || "U"}
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Compose new post..."
                      className="w-full bg-transparent text-gray-500 dark:text-gray-400 placeholder-gray-400 outline-none py-2"
                    />
                    <div className="flex items-center gap-4 mt-2 text-gray-400">
                      <button className="hover:text-[#00AFF0] transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </button>
                      <button className="hover:text-[#00AFF0] transition-colors">
                        <AlignLeft className="w-5 h-5" />
                      </button>
                      <button className="hover:text-[#00AFF0] transition-colors">
                        <ArrowUpRight className="w-5 h-5" />
                      </button>
                      <button className="hover:text-[#00AFF0] transition-colors text-sm font-medium">
                        Aa
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feed Filter Tabs */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setFeedFilter("all")}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    feedFilter === "all"
                      ? "bg-[#00AFF0] text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFeedFilter("subscribed")}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>

              {/* Posts Feed */}
              <div>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-200 dark:border-gray-800 p-4 animate-pulse"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-full" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      </div>
                      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg mt-4" />
                    </div>
                  ))
                ) : posts.length === 0 ? (
                  // Empty state
                  <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Home className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Your feed is empty
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Subscribe to creators to see their posts here
                    </p>
                    <Link href="/explore">
                      <button className="px-6 py-2.5 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
                        Explore Creators
                      </button>
                    </Link>
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
                        className="border-b border-gray-200 dark:border-gray-800"
                      >
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}

                {/* Load More */}
                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-2 text-[#00AFF0] font-medium hover:underline"
                    >
                      Load More
                    </button>
                  </div>
                )}
              </div>
            </div>
          </main>

          {/* Right Sidebar */}
          <aside className="hidden xl:block w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00AFF0] transition-shadow"
                />
              </div>
            </div>

            {/* Suggestions */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Suggestions
                </h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronLeft className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Creator Suggestion Cards */}
              <SuggestedCreatorsCards />

              {/* Pagination Dots */}
              <div className="flex items-center justify-center gap-1 mt-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      i === 0 ? "bg-[#00AFF0]" : "bg-gray-300 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Footer Links */}
            <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Link href="/privacy" className="hover:underline">
                  Privacy
                </Link>
                <span>·</span>
                <Link href="/cookies" className="hover:underline">
                  Cookie Notice
                </Link>
                <span>·</span>
                <Link href="/terms" className="hover:underline">
                  Terms of Service
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SmartRouter>
  );
}

// OnlyFans-style suggestion cards with cover photo
function SuggestedCreatorsCards() {
  const { data: creators, isLoading } = useVerifiedCreators();

  // Take first 3 creators for suggestions
  const suggestedCreators = creators?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (suggestedCreators.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        No suggestions available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {suggestedCreators.map((creator) => (
        <Link
          key={creator.id}
          href={`/u/${creator.user?.email?.split("@")[0] || creator.id}`}
          className="block relative rounded-lg overflow-hidden group"
        >
          {/* Cover Image - Gradient background */}
          <div
            className="h-24 relative"
            style={{
              background: `linear-gradient(135deg, 
                hsl(${Math.random() * 60 + 200}, 70%, 50%), 
                hsl(${Math.random() * 60 + 280}, 70%, 40%))`,
            }}
          >
            {/* Free Badge */}
            <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded">
              Free
            </span>
            {/* Verified Badge */}
            {creator.status === "verified" && (
              <span className="absolute top-2 right-2 w-5 h-5 bg-[#00AFF0] rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            )}
          </div>

          {/* Avatar & Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            <div className="flex items-end gap-2">
              {/* Avatar */}
              {creator.user?.profileImageUrl ? (
                <Image
                  src={creator.user.profileImageUrl}
                  alt={creator.user.firstName || "Creator"}
                  width={44}
                  height={44}
                  className="rounded-full border-2 border-white object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 border-2 border-white flex items-center justify-center text-white font-bold">
                  {creator.user?.firstName?.[0] || creator.title?.[0] || "C"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm truncate flex items-center gap-1">
                  {creator.user?.firstName || creator.title}
                  {creator.status === "verified" && (
                    <svg
                      className="w-3.5 h-3.5 text-[#00AFF0]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  )}
                </p>
                <p className="text-gray-300 text-xs truncate">
                  @
                  {creator.user?.email?.split("@")[0] || creator.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      ))}
    </div>
  );
}
