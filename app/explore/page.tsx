"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useVerifiedCreators, Creator } from "@/hooks/useCreators";
import {
  useFollowCreator,
  useUnfollowCreator,
  useIsFollowingCreator,
} from "@/hooks/useProfile";
import { useCurrentUser, useCompleteDiscovery } from "@/hooks/useCurrentUser";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Search,
  TrendingUp,
  Loader2,
  Menu,
  X,
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  GraduationCap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const categories = [
  "All",
  "AI & ML",
  "Web Dev",
  "Mobile",
  "Data Science",
  "DevOps",
  "Design",
  "Business",
];

function CreatorCard({
  creator,
  onFollow,
  isFollowing,
  isFollowPending,
  isSignedIn,
}: {
  creator: Creator;
  onFollow: () => void;
  isFollowing: boolean;
  isFollowPending: boolean;
  isSignedIn: boolean;
}) {
  const displayName =
    creator.profile?.displayName || creator.user?.firstName || creator.title;
  const handle = creator.profile?.handle || creator.userId.slice(0, 8);
  const avatarUrl = creator.profile?.avatarUrl || creator.user?.profileImageUrl;
  const bannerUrl = creator.profile?.bannerUrl;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-all"
    >
      {/* Banner */}
      <div className="relative h-24 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
        {bannerUrl && (
          <Image src={bannerUrl} alt="Banner" fill className="object-cover" />
        )}
      </div>

      {/* Avatar */}
      <div className="relative px-4 -mt-12">
        <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-800">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-400">
              {displayName.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        <div className="flex items-center gap-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {displayName}
          </h3>
          {creator.status === "verified" && (
            <CheckCircle2 className="w-4 h-4 text-[#00AFF0]" />
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">@{handle}</p>

        {creator.bio && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {creator.bio}
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span>
            <strong className="text-gray-900 dark:text-white">
              {creator.totalReviews?.toLocaleString() || 0}
            </strong>{" "}
            Reviews
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Link href={`/${handle}`} className="flex-1">
            <button className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              View Profile
            </button>
          </Link>
          {isSignedIn ? (
            <button
              onClick={onFollow}
              disabled={isFollowPending}
              className={cn(
                "flex-1 px-4 py-2 rounded-full text-sm font-semibold transition-colors",
                isFollowing
                  ? "border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500"
                  : "bg-[#00AFF0] text-white hover:bg-[#009AD6]"
              )}
            >
              {isFollowPending ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : isFollowing ? (
                "Following"
              ) : (
                "Follow"
              )}
            </button>
          ) : (
            <SignInButton mode="modal">
              <button className="flex-1 px-4 py-2 bg-[#00AFF0] text-white rounded-full text-sm font-semibold hover:bg-[#009AD6] transition-colors">
                Follow
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: creatorsData, isLoading } = useVerifiedCreators();
  const completeDiscovery = useCompleteDiscovery();
  const followCreator = useFollowCreator();
  const unfollowCreator = useUnfollowCreator();

  const isCreatorUser =
    currentUser?.role === "creator" || currentUser?.role === "admin";

  const creators = creatorsData || [];

  // Filter creators based on search query
  const filteredCreators = creators.filter((creator: Creator) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const displayName =
        creator.profile?.displayName ||
        creator.user?.firstName ||
        creator.title;
      const handle = creator.profile?.handle || "";
      return (
        displayName.toLowerCase().includes(query) ||
        handle.toLowerCase().includes(query) ||
        creator.bio?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleFollow = async (
    creatorId: string,
    isCurrentlyFollowing: boolean
  ) => {
    if (!isSignedIn) return;
    if (isCurrentlyFollowing) {
      await unfollowCreator.mutateAsync(creatorId);
    } else {
      await followCreator.mutateAsync(creatorId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
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
          <div className="hidden lg:block p-4 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-brand-purple-600 dark:text-brand-purple-400">
                Athena
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 overflow-y-auto">
            <ul className="space-y-1">
              {socialNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-6 py-3 text-[15px] transition-colors",
                      item.href === "/explore"
                        ? "text-gray-900 dark:text-white font-semibold bg-gray-100 dark:bg-gray-900"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                    )}
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
              <div className="mt-4 mx-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                <Link
                  href="/student/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Dashboard</span>
                </Link>
                {isCreatorUser && (
                  <Link
                    href="/creator/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
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
        <main className="flex-1 min-w-0 lg:pt-0 pt-14 p-4 md:p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#00AFF0]" />
              Explore Creators
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Discover amazing creators and learn from the best
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00AFF0] focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategory === category
                    ? "bg-[#00AFF0] text-white"
                    : "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                )}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Creators Grid */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#00AFF0]" />
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                No creators found
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredCreators.map((creator: Creator) => (
                  <CreatorCard
                    key={creator.id}
                    creator={creator}
                    onFollow={() => handleFollow(creator.id, false)}
                    isFollowing={false}
                    isFollowPending={
                      followCreator.isPending || unfollowCreator.isPending
                    }
                    isSignedIn={!!isSignedIn}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
