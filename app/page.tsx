"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MoreHorizontal,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  AlignLeft,
  ArrowUpRight,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useDiscoverFeed, Post } from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { PostCard } from "@/components/feed";
import { useVerifiedCreators } from "@/hooks/useCreators";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";

// Suggested creators component
function SuggestedCreatorsCards() {
  const { data: creatorsData } = useVerifiedCreators();
  const creators = creatorsData?.slice(0, 6) || [];

  if (creators.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
        No creators to suggest yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {creators.map((creator) => {
        const name =
          creator.user?.firstName && creator.user?.lastName
            ? `${creator.user.firstName} ${creator.user.lastName}`
            : creator.title;
        return (
          <Link
            key={creator.id}
            href={`/${creator.profile?.handle || creator.userId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {creator.user?.profileImageUrl ? (
              <Image
                src={creator.user.profileImageUrl}
                alt={name}
                width={40}
                height={40}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                {name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{creator.profile?.handle || "creator"}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

const socialNav = [
  { name: "Home", href: "/", icon: Home },
  { name: "Explore", href: "/explore", icon: Search },
];

const authNav = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Messages", href: "/messages", icon: MessageSquare },
  { name: "Collections", href: "/collections", icon: Bookmark },
  { name: "Subscriptions", href: "/subscriptions", icon: Users },
  { name: "My profile", href: "/profile", icon: User },
];

export default function FeedPage() {
  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: discoverFeedData, isLoading } = useDiscoverFeed(page, 20);

  const posts: Post[] = discoverFeedData?.posts || [];
  const hasMore = discoverFeedData?.hasMore || false;

  const isCreator = currentUser?.isCreator || currentUser?.isAdmin;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <Link
          href="/"
          className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
        >
          Athena
        </Link>
        {isSignedIn ? (
          <ThemeToggle />
        ) : (
          <SignInButton mode="modal">
            <button className="px-3 py-1.5 bg-[#00AFF0] text-white text-sm font-medium rounded-full">
              Login
            </button>
          </SignInButton>
        )}
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-50 w-64 lg:w-60 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen lg:sticky lg:top-0 transform transition-transform duration-200 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          {/* Close button for mobile */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400">
              Athena
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>

          {/* Logo - Desktop */}
          <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-brand-purple-600 dark:text-brand-purple-400">
                Athena
              </span>
            </Link>
            <ThemeToggle />
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {socialNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-4 px-6 py-3 text-[15px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}

              {/* Auth-required nav items */}
              {isSignedIn &&
                authNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-4 px-6 py-3 text-[15px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
            </ul>

            {/* Quick Links for logged in users */}
            {isSignedIn && (
              <div className="mt-4 mx-4 space-y-2">
                <Link
                  href="/student/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 border border-blue-200/50 dark:border-blue-500/30 rounded-xl transition-all group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-medium text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                    Student Dashboard
                  </span>
                </Link>

                {isCreator && (
                  <Link
                    href="/creator/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-200/50 dark:border-purple-500/30 rounded-xl transition-all group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200">
                      Creator Studio
                    </span>
                  </Link>
                )}
              </div>
            )}
          </nav>

          {/* Auth Buttons or User Info */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {isSignedIn ? (
              <Link
                href="/profile"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
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
                    {currentUser?.firstName?.[0] ||
                      currentUser?.username?.[0] ||
                      "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {currentUser?.firstName || currentUser?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    @{currentUser?.username || "user"}
                  </p>
                </div>
              </Link>
            ) : (
              <div className="space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2.5 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            )}
            <div className="mt-3">
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 lg:pt-0 pt-14">
          {/* Header */}
          <header className="sticky top-0 lg:top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 h-14">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                FEED
              </h1>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <MoreHorizontal className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </header>

          <div className="max-w-2xl mx-auto">
            {/* Compose Box - Only for logged in users */}
            {isSignedIn ? (
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
                      {currentUser?.firstName?.[0] ||
                        currentUser?.username?.[0] ||
                        "U"}
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
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-b border-gray-200 dark:border-gray-800 p-6 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Join Athena to interact with posts and creators
                </p>
                <div className="flex items-center justify-center gap-3">
                  <SignInButton mode="modal">
                    <button className="px-6 py-2 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
                      Log in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      Sign up
                    </button>
                  </SignUpButton>
                </div>
              </div>
            )}

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
                    No posts yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Be the first to share something!
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
                placeholder="Search"
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
                  <RefreshCw className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Creator Suggestion Cards */}
            <SuggestedCreatorsCards />
          </div>

          {/* Auth prompt for guests */}
          {!isSignedIn && (
            <div className="mx-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                New to Athena?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Sign up to follow creators, like posts, and more.
              </p>
              <SignUpButton mode="modal">
                <button className="w-full px-4 py-2 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors text-sm">
                  Create account
                </button>
              </SignUpButton>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
