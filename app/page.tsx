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
import { PostCard, CreatePostForm } from "@/components/feed";
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
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-xl transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Studio</span>
                </Link>

                {isCreator && (
                  <Link
                    href="/creator/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-950 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Creator Studio</span>
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
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <CreatePostForm />
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

        {/* Daily AI News Sidebar */}
        <aside className="hidden xl:block w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto scrollbar-hide">
          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search AI News"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
              />
            </div>
          </div>

          {/* Daily AI News */}
          <div className="mx-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Daily AI News
            </h3>
            <div className="space-y-3">
              <a
                href="https://news.google.com/search?q=AI+in+medicine"
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏥</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Healthcare
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI in Medicine
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Latest breakthroughs
                </span>
              </a>

              <a
                href="https://news.google.com/search?q=AI+in+education"
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">📚</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    EdTech
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI in Education
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Transforming learning
                </span>
              </a>

              <a
                href="https://news.google.com/search?q=new+AI+tools"
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🛠️</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Tools
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  New AI Tools
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Productivity & creative
                </span>
              </a>

              <a
                href="https://news.google.com/search?q=AI+research"
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🔬</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Research
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  AI Research
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Latest discoveries
                </span>
              </a>
            </div>
            <a
              href="https://news.google.com/search?q=artificial+intelligence"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline block"
            >
              More AI news →
            </a>
          </div>

          {/* AI Trending Topics */}
          <div className="mx-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              AI Trending
            </h3>
            <div className="space-y-3">
              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    AI · Trending
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #ChatGPT
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  45.2K posts
                </span>
              </div>

              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Technology · Trending
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #OpenAI
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  32.8K posts
                </span>
              </div>

              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    AI · Trending
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #GenerativeAI
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  28.1K posts
                </span>
              </div>
            </div>
            <button className="mt-3 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline">
              Show more
            </button>
          </div>

          {/* Featured AI Agent */}
          <div className="mx-4 mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-semibold text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                  Featured
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      AI Assistant Pro
                    </h4>
                    <p className="text-white/90 text-xs">Your AI companion</p>
                  </div>
                </div>
                <p className="text-white/95 text-xs mb-3 leading-relaxed">
                  Chat with our most advanced AI agent. Get help with coding, writing, and more.
                </p>
                <Link href="/explore/agents">
                  <button className="w-full py-2 bg-white text-purple-600 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Try Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Sidebar - Monetization & Discovery */}
        <aside className="hidden xl:block w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto scrollbar-hide">
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

          {/* Featured Sponsor Ad */}
          <div className="mx-4 mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 p-4 group cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-semibold text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">
                      Athena Premium
                    </h4>
                    <p className="text-white/90 text-xs">Unlock full access</p>
                  </div>
                </div>
                <p className="text-white/95 text-xs mb-3 leading-relaxed">
                  Get unlimited AI agents, priority support, and exclusive
                  creator content
                </p>
                <button className="w-full py-2 bg-white text-purple-600 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">
                  Try Premium Free
                </button>
              </div>
            </div>
          </div>

          {/* What's Happening */}
          <div className="mx-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              What&apos;s happening
            </h3>
            <div className="space-y-3">
              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Trending in Tech
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #AIAgents
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  12.5K posts
                </span>
              </div>

              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Trending in Learning
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  #MachineLearning
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  8.3K posts
                </span>
              </div>

              <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Education · Trending
                  </span>
                  <MoreHorizontal className="w-3 h-3 text-gray-400" />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Online Courses
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  5.1K posts
                </span>
              </div>
            </div>
            <button className="mt-3 text-[#00AFF0] text-sm font-medium hover:underline">
              Show more
            </button>
          </div>

          {/* Top Creators */}
          <div className="mx-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Top Creators
              </h3>
              <button className="text-[#00AFF0] text-xs font-medium hover:underline">
                See all
              </button>
            </div>
            <SuggestedCreatorsCards />
          </div>

          {/* Banner Ad Slot */}
          <div className="mx-4 mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-r from-teal-500 to-cyan-600 p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-semibold text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                  Ad
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">
                    Learn Faster
                  </h4>
                  <p className="text-white/90 text-xs">
                    AI-powered study tools
                  </p>
                </div>
              </div>
              <button className="mt-3 w-full py-1.5 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg text-xs hover:bg-white/30 transition-colors">
                Get Started →
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mx-4 mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      5 new creators
                    </span>{" "}
                    joined today
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-500">
                    2 hours ago
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      150+ active learners
                    </span>{" "}
                    right now
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-500">
                    Live
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      New AI agent
                    </span>{" "}
                    for coding help
                  </p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-500">
                    5 hours ago
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Promotional Card */}
          <div className="mx-4 mb-4">
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="absolute top-2 right-2">
                <span className="text-[10px] font-semibold text-white/70 bg-black/20 px-2 py-0.5 rounded-full">
                  Promoted
                </span>
              </div>
              <div className="relative z-10">
                <h4 className="text-white font-bold text-sm mb-2">
                  📚 Become a Creator
                </h4>
                <p className="text-white/95 text-xs mb-3 leading-relaxed">
                  Share your knowledge and earn. Create AI agents, host
                  sessions, and build your audience.
                </p>
                <Link href="/creator/onboarding">
                  <button className="w-full py-2 bg-white text-purple-600 font-semibold rounded-lg text-sm hover:bg-gray-100 transition-colors">
                    Start Creating
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Auth prompt for guests */}
          {!isSignedIn && (
            <div className="mx-4 mb-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                Don&apos;t miss what&apos;s happening
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Join Athena to follow creators, chat with AI agents, and book
                sessions.
              </p>
              <div className="space-y-2">
                <SignInButton mode="modal">
                  <button className="w-full px-4 py-2.5 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors text-sm">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm">
                    Create account
                  </button>
                </SignUpButton>
              </div>
            </div>
          )}

          {/* Footer Links */}
          <div className="px-4 pb-4">
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:underline">
                Terms of Service
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Cookie Policy
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Accessibility
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                Ads info
              </a>
              <span>·</span>
              <a href="#" className="hover:underline">
                More
              </a>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              © 2025 Athena Corp.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
