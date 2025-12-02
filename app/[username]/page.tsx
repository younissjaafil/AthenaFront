"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  useProfile,
  useFollowCreator,
  useUnfollowCreator,
  useIsFollowingCreator,
  useCreatorStats,
} from "@/hooks/useProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreatorPosts } from "@/hooks/useFeed";
import { PostCard } from "@/components/feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
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
  Loader2,
  Lock,
  Bot,
  FileText,
  Calendar,
  Home,
  Bell,
  MessageSquare,
  Bookmark,
  Users,
  User,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tabs differ based on creator status
type CreatorTabType = "posts" | "media" | "agents" | "docs" | "sessions";
type RegularTabType = "posts" | "media";
type TabType = CreatorTabType | RegularTabType;

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

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const [activeTab, setActiveTab] = useState<TabType>("posts");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(username);
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
  const postCount = postsData?.total || 0;
  const likesCount = creatorStats?.followersCount
    ? creatorStats.followersCount * 10
    : 0;

  const handleFollowToggle = async () => {
    if (!isSignedIn) return;
    if (!profile?.creatorId) return;
    if (isFollowing) {
      await unfollowCreator.mutateAsync(profile.creatorId);
    } else {
      await followCreator.mutateAsync(profile.creatorId);
    }
  };

  const isCreatorUser = currentUser?.isCreator || currentUser?.isAdmin;
  const isViewingOwnProfileByUsername = currentUser?.username === username;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#00AFF0]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-950 px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center">
          {isViewingOwnProfileByUsername
            ? `Your profile @${username} is being set up. Please try accessing it from the My Profile menu.`
            : `User @${username} does not exist`}
        </p>
        <div className="flex gap-3">
          {isViewingOwnProfileByUsername && (
            <Link href="/profile">
              <button className="px-6 py-2 bg-purple-600 text-white rounded-full font-medium hover:bg-purple-700 transition-colors">
                Go to My Profile
              </button>
            </Link>
          )}
          <Link href="/explore">
            <button className="px-6 py-2 bg-[#00AFF0] text-white rounded-full font-medium hover:bg-[#009AD6] transition-colors">
              Explore Creators
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const posts = postsData?.posts || [];

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
              <div className="mt-4 mx-4 p-2 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                <Link
                  href="/student/dashboard"
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Studio</span>
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
                    @{currentUser?.username}
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
          {/* Banner */}
          <div className="relative h-48 md:h-56 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            {profile.bannerUrl && (
              <Image
                src={profile.bannerUrl}
                alt="Banner"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-4 md:px-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            {/* Avatar */}
            <div className="absolute -top-16 left-4 md:left-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-950 overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.displayName || "Profile"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {(profile.displayName || profile.handle || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              {isOwnProfile ? (
                <Link href="/profile">
                  <button className="px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    Edit profile
                  </button>
                </Link>
              ) : isCreator && isSignedIn ? (
                <button
                  onClick={handleFollowToggle}
                  disabled={isFollowPending}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-colors",
                    isFollowing
                      ? "border border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500"
                      : "bg-[#00AFF0] text-white hover:bg-[#009AD6]"
                  )}
                >
                  {isFollowPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isFollowing ? (
                    "Following"
                  ) : (
                    "Follow"
                  )}
                </button>
              ) : isCreator && !isSignedIn ? (
                <SignInButton mode="modal">
                  <button className="px-5 py-2 bg-[#00AFF0] text-white rounded-full text-sm font-semibold hover:bg-[#009AD6] transition-colors">
                    Follow
                  </button>
                </SignInButton>
              ) : null}
              <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="p-2 border border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Name & Handle */}
            <div className="mt-16 md:mt-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.displayName || profile.handle}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                @{profile.handle}
              </p>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="mt-3 text-gray-700 dark:text-gray-300">
                {profile.bio}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 mt-4 text-sm">
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {profile.followingCount || 0}
                </strong>{" "}
                <span className="text-gray-500">Following</span>
              </span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {profile.followerCount || 0}
                </strong>{" "}
                <span className="text-gray-500">Followers</span>
              </span>
            </div>

            {/* Quick Actions for Creator */}
            {isCreator && (
              <div className="flex items-center gap-2 mt-4">
                <Link href="/student/dashboard">
                  <button className="flex items-center gap-2 px-4 py-2 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full text-sm font-medium hover:bg-teal-500/20 transition-colors">
                    <GraduationCap className="w-4 h-4" />
                    Student Studio
                  </button>
                </Link>
              </div>
            )}
          </div>

          {/* Tabs - Different for creators vs regular users */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 sticky top-14 lg:top-0 bg-white dark:bg-gray-950 z-10">
            {/* Posts tab - Everyone */}
            <button
              onClick={() => setActiveTab("posts")}
              className={cn(
                "flex-1 py-4 text-sm font-medium text-center relative",
                activeTab === "posts"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Grid3X3 className="w-5 h-5 mx-auto" />
              {activeTab === "posts" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AFF0]" />
              )}
            </button>

            {/* Media tab - Everyone */}
            <button
              onClick={() => setActiveTab("media")}
              className={cn(
                "flex-1 py-4 text-sm font-medium text-center relative",
                activeTab === "media"
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <Video className="w-5 h-5 mx-auto" />
              {activeTab === "media" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AFF0]" />
              )}
            </button>

            {/* Creator-only tabs */}
            {isCreator && (
              <>
                {/* Agents tab */}
                <button
                  onClick={() => setActiveTab("agents")}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium text-center relative",
                    activeTab === "agents"
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Bot className="w-5 h-5 mx-auto" />
                  {activeTab === "agents" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AFF0]" />
                  )}
                </button>

                {/* Docs tab */}
                <button
                  onClick={() => setActiveTab("docs")}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium text-center relative",
                    activeTab === "docs"
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <FileText className="w-5 h-5 mx-auto" />
                  {activeTab === "docs" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AFF0]" />
                  )}
                </button>

                {/* Sessions tab */}
                <button
                  onClick={() => setActiveTab("sessions")}
                  className={cn(
                    "flex-1 py-4 text-sm font-medium text-center relative",
                    activeTab === "sessions"
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Calendar className="w-5 h-5 mx-auto" />
                  {activeTab === "sessions" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00AFF0]" />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Tab Content */}
          <div className="pb-20">
            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div>
                {postsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-12">
                    <Grid3X3 className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No posts yet
                    </p>
                  </div>
                ) : (
                  <div>
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="border-b border-gray-200 dark:border-gray-800"
                      >
                        <PostCard post={post} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <div className="text-center py-12">
                <Video className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No media yet</p>
              </div>
            )}

            {/* Agents Tab - Creator only */}
            {activeTab === "agents" && isCreator && (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No agents yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  AI agents created by this creator will appear here
                </p>
              </div>
            )}

            {/* Docs Tab - Creator only */}
            {activeTab === "docs" && isCreator && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No documents yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Knowledge documents shared by this creator
                </p>
              </div>
            )}

            {/* Sessions Tab - Creator only */}
            {activeTab === "sessions" && isCreator && (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  No sessions available
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Book 1-on-1 consultation sessions with this creator
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
