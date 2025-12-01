"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  useProfile,
  useFollowCreator,
  useUnfollowCreator,
  useIsFollowingCreator,
  useCreatorStats,
} from "@/hooks/useProfile";
import { useCreatorAgents, useCreatorDocuments } from "@/hooks/useCreators";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreatorPosts } from "@/hooks/useFeed";
import { PostCard } from "@/components/feed";
import {
  ArrowLeft,
  Star,
  Share2,
  MoreHorizontal,
  ImageIcon,
  Film,
  Heart,
  Search,
  Grid3X3,
  Filter,
  Loader2,
  Lock,
  Bot,
  FileText,
  Calendar,
} from "lucide-react";
import Link from "next/link";

type TabType = "posts" | "media";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const handle = params.handle as string;
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(handle);
  const { data: creatorStats } = useCreatorStats(profile?.creatorId || "");
  const { data: isFollowingData } = useIsFollowingCreator(
    profile?.creatorId || ""
  );
  const { data: postsData, isLoading: postsLoading } = useCreatorPosts(
    profile?.creatorId || "",
    1,
    20
  );

  const followCreator = useFollowCreator();
  const unfollowCreator = useUnfollowCreator();

  const isOwnProfile = currentUser?.id === profile?.userId;
  const isCreator = !!profile?.creatorId;
  const isFollowing = isFollowingData?.isFollowing || false;
  const isFollowPending = followCreator.isPending || unfollowCreator.isPending;

  // Stats
  const postCount = postsData?.total || 183;
  const mediaCount = 192;
  const likesCount = creatorStats?.followersCount
    ? creatorStats.followersCount * 10
    : 12800;

  const handleFollowToggle = async () => {
    if (!profile?.creatorId) return;
    if (isFollowing) {
      await unfollowCreator.mutateAsync(profile.creatorId);
    } else {
      await followCreator.mutateAsync(profile.creatorId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#00AFF0]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          User @{handle} does not exist
        </p>
        <Link href="/explore">
          <button className="px-6 py-2 bg-[#00AFF0] text-white rounded-full font-medium hover:bg-[#009AD6] transition-colors">
            Explore Creators
          </button>
        </Link>
      </div>
    );
  }

  const posts = postsData?.posts || [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="flex">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
                <div>
                  <h1 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    {profile.displayName || `@${handle}`}
                    {profile.isVerified && <VerifiedBadge />}
                  </h1>
                  <p className="text-xs text-gray-500">Seen 8 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Star className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  <MoreHorizontal className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </header>

          <div className="max-w-2xl mx-auto">
            {/* Cover Image with Stats */}
            <div className="relative">
              <div
                className="h-44 bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600"
                style={{
                  backgroundImage: profile.bannerUrl
                    ? `url(${profile.bannerUrl})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Stats Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-3 text-white text-sm">
                  <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded">
                    <ImageIcon className="w-4 h-4" />
                    <span>{postCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded">
                    <Film className="w-4 h-4" />
                    <span>{mediaCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded">
                    <Heart className="w-4 h-4" />
                    <span>
                      {likesCount > 1000
                        ? `${(likesCount / 1000).toFixed(1)}K`
                        : likesCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Avatar */}
              <div className="absolute -bottom-14 left-4">
                <div className="w-28 h-28 rounded-full border-4 border-white dark:border-gray-950 overflow-hidden bg-gradient-to-br from-amber-400 to-pink-500 shadow-lg">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.displayName || handle}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                      {profile.displayName?.[0] || handle[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute -bottom-5 right-4 flex items-center gap-2">
                <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Star className="w-5 h-5 text-gray-400" />
                </button>
                <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Share2 className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="pt-16 px-4">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {profile.displayName || `@${handle}`}
                </h1>
                {profile.isVerified && <VerifiedBadge />}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                @{handle} · Seen 8 hours ago
              </p>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-2 whitespace-pre-wrap">
                  {profile.bio}
                </p>
              )}

              <button className="text-[#00AFF0] text-sm font-medium hover:underline">
                More info
              </button>

              {/* Highlights */}
              {isCreator && (
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 -mx-4 px-4">
                  {[
                    { label: "AI Agents 🤖", count: 5 },
                    { label: "Documents 📄", count: 12 },
                    { label: "Sessions 📅", count: 8 },
                  ].map((item, i) => (
                    <div key={i} className="flex-shrink-0 w-20">
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center mb-1">
                        <span className="text-2xl">
                          {item.label.split(" ")[1]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate text-center">
                        {item.label.split(" ")[0]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Subscription Box */}
            {!isOwnProfile && (
              <div className="px-4 mt-6">
                <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Subscription
                  </p>
                  <button
                    onClick={handleFollowToggle}
                    disabled={isFollowPending}
                    className={`w-full py-3 rounded-full font-semibold text-sm transition-all flex items-center justify-between px-4 ${
                      isFollowing
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                        : "bg-[#00AFF0] hover:bg-[#009AD6] text-white"
                    }`}
                  >
                    <span>
                      {isFollowPending
                        ? "..."
                        : isFollowing
                        ? "SUBSCRIBED"
                        : "SUBSCRIBE"}
                    </span>
                    <span className="text-sm">
                      {isFollowing ? "✓" : "FOR FREE"}
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                    activeTab === "posts"
                      ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {postCount} POSTS
                </button>
                <button
                  onClick={() => setActiveTab("media")}
                  className={`flex-1 py-4 text-sm font-semibold text-center border-b-2 transition-colors ${
                    activeTab === "media"
                      ? "border-gray-900 dark:border-white text-gray-900 dark:text-white"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {mediaCount} MEDIA
                </button>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent
                </span>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <Search className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <Grid3X3 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <Filter className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300">
                  All {postCount}
                </button>
                <button className="px-3 py-1.5 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                  Archive 33
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="pb-20">
              {postsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-[#00AFF0]" />
                </div>
              ) : posts.length > 0 ? (
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
              ) : (
                // Demo locked post
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-white font-bold">
                      {profile.displayName?.[0] || handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {profile.displayName}
                        </span>
                        {profile.isVerified && <VerifiedBadge size="sm" />}
                      </div>
                      <p className="text-xs text-gray-500">@{handle}</p>
                    </div>
                    <span className="text-xs text-gray-400">Oct 12</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    let&apos;s stay up all night together?? 😊
                  </p>
                  {/* Locked Content Placeholder */}
                  <div className="relative h-64 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div className="absolute inset-0 backdrop-blur-xl bg-black/30 flex flex-col items-center justify-center">
                      <Lock className="w-12 h-12 text-white/70 mb-2" />
                      <p className="text-white/70 text-sm">
                        Subscribe to unlock
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <RightSidebar
          profile={profile}
          isFollowing={isFollowing}
          isFollowPending={isFollowPending}
          onFollowToggle={handleFollowToggle}
        />
      </div>
    </div>
  );
}

// Verified badge component
function VerifiedBadge({ size = "md" }: { size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  return (
    <svg
      className={`${sizeClass} text-[#00AFF0]`}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </svg>
  );
}

// Left Sidebar component
function LeftSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 h-screen sticky top-0 border-r border-gray-200 dark:border-gray-800">
      <div className="p-4">
        <Link
          href="/home"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
        </Link>
      </div>

      <nav className="flex-1 py-2">
        <ul className="space-y-1">
          {[
            { href: "/home", label: "Home", icon: "🏠" },
            { href: "/notifications", label: "Notifications", icon: "🔔" },
            { href: "/messages", label: "Messages", icon: "💬" },
            { href: "/collections", label: "Collections", icon: "📚" },
            { href: "/subscriptions", label: "Subscriptions", icon: "👥" },
            { href: "/profile", label: "My profile", icon: "👤" },
            { href: "#", label: "More", icon: "•••" },
          ].map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-4 px-6 py-3 text-[15px] text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <span className="w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <button className="w-full flex items-center justify-center gap-2 py-3 bg-[#00AFF0] hover:bg-[#009AD6] text-white font-semibold rounded-full transition-colors">
          + NEW POST
        </button>
      </div>
    </aside>
  );
}

// Right Sidebar component
function RightSidebar({
  profile,
  isFollowing,
  isFollowPending,
  onFollowToggle,
}: {
  profile: any;
  isFollowing: boolean;
  isFollowPending: boolean;
  onFollowToggle: () => void;
}) {
  return (
    <aside className="hidden xl:block w-80 h-screen sticky top-0 border-l border-gray-200 dark:border-gray-800 overflow-y-auto">
      {/* Search */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search user's post"
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#00AFF0] transition-shadow"
          />
        </div>
      </div>

      {/* Subscription Card */}
      <div className="px-4 pb-4">
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
          <div className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Subscription
            </p>
            <button
              onClick={onFollowToggle}
              disabled={isFollowPending}
              className={`w-full py-3 rounded-full font-semibold text-sm transition-all flex items-center justify-between px-4 ${
                isFollowing
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  : "bg-[#00AFF0] hover:bg-[#009AD6] text-white"
              }`}
            >
              <span>
                {isFollowPending
                  ? "..."
                  : isFollowing
                  ? "SUBSCRIBED"
                  : "SUBSCRIBE"}
              </span>
              <span>{isFollowing ? "✓" : "FOR FREE"}</span>
            </button>
          </div>
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
  );
}
