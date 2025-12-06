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
import { useCreatorAgents } from "@/hooks/useAgents";
import {
  useCreatorProfileDocuments,
  useDeleteDocument,
} from "@/hooks/useDocuments";
import {
  useCreatorAvailability,
  useCreatorSessionSettings,
  useCreatorDateOverrides,
} from "@/hooks/useSessions";
import { PostCard } from "@/components/feed";
import { ThemeToggle } from "@/components/theme-toggle";
import { SecurePdfViewer } from "@/components/documents/SecurePdfViewer";
import {
  DAY_NAMES,
  type AvailabilitySlot,
  type DayOfWeek,
} from "@/lib/types/session";
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
  Trash2,
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
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    filename?: string;
    creatorId?: string;
    fileType?: string | null;
    fileSize?: number | null;
  } | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<string | null>(null);

  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(username);
  const { data: creatorStats } = useCreatorStats(profile?.creatorId || "");
  const { data: isFollowingData } = useIsFollowingCreator(
    profile?.creatorId || "",
    isSignedIn ?? false
  );
  const { data: postsData, isLoading: postsLoading } = useCreatorPosts(
    profile?.creatorId || "",
    1,
    20
  );
  const { data: creatorAgents, isLoading: agentsLoading } = useCreatorAgents(
    profile?.creatorId || ""
  );
  const { data: profileDocuments, isLoading: documentsLoading } =
    useCreatorProfileDocuments(profile?.creatorId || "");
  const { data: availability, isLoading: availabilityLoading } =
    useCreatorAvailability(profile?.creatorId || "");
  const { data: sessionSettings, isLoading: settingsLoading } =
    useCreatorSessionSettings(profile?.creatorId || "");
  const { data: dateOverrides } = useCreatorDateOverrides(
    profile?.creatorId || ""
  );

  const followCreator = useFollowCreator();
  const unfollowCreator = useUnfollowCreator();
  const deleteDocument = useDeleteDocument();

  const isOwnProfile = currentUser?.id === profile?.userId;
  const isAdmin = currentUser?.roles?.includes("admin");
  const canDeleteDocs = isOwnProfile || isAdmin;
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

  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument.mutateAsync({
        documentId: docId,
        creatorId: profile?.creatorId,
      });
      setDeleteDocId(null);
    } catch (error) {
      console.error("Failed to delete document:", error);
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
      {/* Document Preview Modal */}
      <AnimatePresence>
        {previewDoc?.id && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {previewDoc.filename || "Document"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {previewDoc.fileType?.toUpperCase()}
                    {previewDoc.fileSize
                      ? ` • ${(previewDoc.fileSize / 1024).toFixed(1)} KB`
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Document Preview */}
              <div className="h-[calc(100%-80px)] overflow-auto bg-gray-50 dark:bg-gray-950">
                {previewDoc.fileType?.toLowerCase() === "pdf" ? (
                  <SecurePdfViewer
                    documentId={previewDoc.id}
                    title={previewDoc.filename || "Document"}
                    onClose={() => setPreviewDoc(null)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8">
                    <FileText className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                      Preview not available for{" "}
                      {previewDoc.fileType?.toUpperCase() || "this"} files
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteDocId && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
            onClick={() => setDeleteDocId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Document
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this document? This will also
                remove all embeddings and cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteDocId(null)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDocument(deleteDocId)}
                  disabled={deleteDocument.isPending}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteDocument.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
          <div className="relative h-40 md:h-48 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500">
            {profile.bannerUrl && (
              <Image
                src={profile.bannerUrl}
                alt="Banner"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Profile Content - Two Column Layout */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Profile Info */}
              <div className="lg:col-span-4">
                {/* Avatar */}
                <div className="flex justify-center lg:justify-start -mt-16 mb-4">
                  <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500">
                    <div className="w-full h-full rounded-full border-4 border-white dark:border-gray-950 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 relative">
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
                </div>

                {/* Profile Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sticky top-20">
                  {/* Name & Handle */}
                  <div className="text-center lg:text-left">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.displayName || profile.handle}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      @{profile.handle}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 mt-4">
                    {isOwnProfile ? (
                      <Link href="/profile" className="w-full">
                        <button className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-700 rounded-full text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                          Edit profile
                        </button>
                      </Link>
                    ) : isCreator && isSignedIn ? (
                      <button
                        onClick={handleFollowToggle}
                        disabled={isFollowPending}
                        className={cn(
                          "w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all",
                          isFollowing
                            ? "border-2 border-gray-300 dark:border-gray-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg"
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
                    ) : isCreator && !isSignedIn ? (
                      <SignInButton mode="modal">
                        <button className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full text-sm font-semibold hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all">
                          Follow
                        </button>
                      </SignInButton>
                    ) : null}
                    <div className="flex gap-2">
                      <button className="flex-1 p-2 border-2 border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <Share2 className="w-4 h-4 mx-auto" />
                      </button>
                      <button className="flex-1 p-2 border-2 border-gray-300 dark:border-gray-700 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <MoreHorizontal className="w-4 h-4 mx-auto" />
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-around gap-4 mt-4 py-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex flex-col items-center hover:opacity-70 transition-all">
                      <strong className="text-gray-900 dark:text-white font-bold text-lg">
                        {profile.followingCount || 0}
                      </strong>
                      <span className="text-gray-500 text-xs">Following</span>
                    </button>
                    <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
                    <button className="flex flex-col items-center hover:opacity-70 transition-all">
                      <strong className="text-gray-900 dark:text-white font-bold text-lg">
                        {profile.followerCount || 0}
                      </strong>
                      <span className="text-gray-500 text-xs">Followers</span>
                    </button>
                  </div>

                  {/* Quick Actions for Creator */}
                  {isCreator && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link href="/student/dashboard" className="block">
                        <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-full text-sm font-semibold hover:from-teal-600 hover:to-cyan-600 shadow-md transition-all">
                          <GraduationCap className="w-4 h-4" />
                          Student Studio
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Content - Tabs & Posts */}
              <div className="lg:col-span-8">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 sticky top-14 lg:top-0 bg-white dark:bg-gray-950 z-10 overflow-x-auto -mt-2">
                  {/* Posts tab */}
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={cn(
                      "flex-1 min-w-[80px] py-4 px-4 text-sm font-semibold text-center relative transition-all",
                      activeTab === "posts"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                    )}
                  >
                    <Grid3X3 className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Posts</span>
                    {activeTab === "posts" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full" />
                    )}
                  </button>

                  {/* Media tab */}
                  <button
                    onClick={() => setActiveTab("media")}
                    className={cn(
                      "flex-1 min-w-[80px] py-4 px-4 text-sm font-semibold text-center relative transition-all",
                      activeTab === "media"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                    )}
                  >
                    <Video className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs">Media</span>
                    {activeTab === "media" && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full" />
                    )}
                  </button>

                  {/* Creator-only tabs */}
                  {isCreator && (
                    <>
                      <button
                        onClick={() => setActiveTab("agents")}
                        className={cn(
                          "flex-1 min-w-[80px] py-4 px-4 text-sm font-semibold text-center relative transition-all",
                          activeTab === "agents"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                      >
                        <Bot className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">Agents</span>
                        {activeTab === "agents" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full" />
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab("docs")}
                        className={cn(
                          "flex-1 min-w-[80px] py-4 px-4 text-sm font-semibold text-center relative transition-all",
                          activeTab === "docs"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                      >
                        <FileText className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">Docs</span>
                        {activeTab === "docs" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full" />
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab("sessions")}
                        className={cn(
                          "flex-1 min-w-[80px] py-4 px-4 text-sm font-semibold text-center relative transition-all",
                          activeTab === "sessions"
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                      >
                        <Calendar className="w-5 h-5 mx-auto mb-1" />
                        <span className="text-xs">Sessions</span>
                        {activeTab === "sessions" && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-full" />
                        )}
                      </button>
                    </>
                  )}
                </div>

                {/* Tab Content */}
                <div className="mt-6 pb-20">
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
                        <div className="space-y-6">
                          {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Media Tab */}
                  {activeTab === "media" && (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No media yet
                      </p>
                    </div>
                  )}

                  {/* Agents Tab - Creator only */}
                  {activeTab === "agents" && isCreator && (
                    <div>
                      {agentsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : !creatorAgents || creatorAgents.length === 0 ? (
                        <div className="text-center py-12">
                          <Bot className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 mb-2">
                            No agents yet
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            AI agents created by this creator will appear here
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          {creatorAgents.map((agent) => (
                            <Link
                              key={agent.id}
                              href={`/explore/agents/${agent.id}`}
                              className="block group"
                            >
                              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg">
                                {/* Agent Header */}
                                <div className="flex items-start gap-4 mb-4">
                                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-6 h-6 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                                      {agent.name}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      {agent.category}
                                    </p>
                                  </div>
                                  {/* Price Badge */}
                                  {agent.pricePerMessage === 0 &&
                                  agent.pricePerConversation === 0 ? (
                                    <div className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                      Free
                                    </div>
                                  ) : (
                                    <div className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-medium">
                                      $
                                      {(
                                        agent.pricePerMessage ||
                                        agent.pricePerConversation ||
                                        0
                                      ).toFixed(2)}
                                    </div>
                                  )}
                                </div>

                                {/* Agent Description */}
                                <p className="text-sm text-gray-600 dark:text-slate-400 mb-4 line-clamp-2">
                                  {agent.description ||
                                    "AI assistant ready to help you"}
                                </p>

                                {/* Agent Stats */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>
                                      {agent.totalConversations || 0} users
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span>
                                      {agent.averageRating
                                        ? agent.averageRating.toFixed(1)
                                        : "New"}
                                    </span>
                                  </div>
                                  {agent.category &&
                                    agent.category.length > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Sparkles className="w-4 h-4" />
                                        <span>{agent.category[0]}</span>
                                      </div>
                                    )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Docs Tab - Creator only */}
                  {activeTab === "docs" && isCreator && (
                    <div>
                      {documentsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : !profileDocuments || profileDocuments.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400 mb-2">
                            No documents yet
                          </p>
                          <p className="text-sm text-gray-400 dark:text-gray-500">
                            Knowledge documents shared by this creator
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                          {profileDocuments.map((doc) => (
                            <div
                              key={doc.id}
                              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg"
                            >
                              <div className="flex items-start gap-4">
                                <div
                                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 cursor-pointer"
                                  onClick={() => {
                                    setPreviewDoc({
                                      id: doc.id,
                                      filename: doc.filename,
                                      creatorId: profile?.creatorId,
                                      fileType: doc.fileType,
                                      fileSize: doc.fileSize,
                                    });
                                  }}
                                >
                                  <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                                    {doc.filename}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {doc.fileType?.toUpperCase()} •{" "}
                                    {doc.fileSize
                                      ? `${(doc.fileSize / 1024).toFixed(1)} KB`
                                      : "Unknown size"}
                                  </p>
                                  {doc.description && (
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                                      {doc.description}
                                    </p>
                                  )}
                                </div>
                                {/* Delete button for owner/admin */}
                                {canDeleteDocs && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteDocId(doc.id);
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title="Delete document"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                              {/* Document stats */}
                              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400">
                                <span
                                  className={cn(
                                    "px-2 py-1 rounded-full text-xs font-medium",
                                    doc.status === "processed"
                                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                      : doc.status === "processing"
                                      ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : doc.status === "failed"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
                                  )}
                                >
                                  {doc.status}
                                </span>
                                {doc.chunkCount !== undefined && (
                                  <span>{doc.chunkCount} chunks</span>
                                )}
                                <button
                                  onClick={() =>
                                    setPreviewDoc({
                                      id: doc.id,
                                      filename: doc.filename,
                                      creatorId: profile?.creatorId,
                                      fileType: doc.fileType,
                                      fileSize: doc.fileSize,
                                    })
                                  }
                                  className="ml-auto text-purple-600 dark:text-purple-400 font-medium hover:underline"
                                >
                                  Click to preview
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sessions Tab - Creator only */}
                  {activeTab === "sessions" && isCreator && (
                    <div className="space-y-6 p-4">
                      {/* Session Settings */}
                      {settingsLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : sessionSettings ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Session Settings
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Available Durations:
                              </span>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {sessionSettings.sessionDurations
                                  ?.map((d) => `${d} min`)
                                  .join(", ") || "Not set"}
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Buffer Time:
                              </span>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {sessionSettings.bufferTime || 0} minutes
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Minimum Notice:
                              </span>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {sessionSettings.minimumNoticeHours || 0} hours
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">
                                Timezone:
                              </span>
                              <p className="text-gray-900 dark:text-white font-medium">
                                {sessionSettings.timezone || "Not set"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Weekly Availability */}
                      {availabilityLoading ? (
                        <div className="flex justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : availability && availability.length > 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Weekly Availability
                          </h3>
                          <div className="space-y-3">
                            {availability.map((slot) => (
                              <div
                                key={slot.id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                              >
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {DAY_NAMES[slot.dayOfWeek as DayOfWeek]}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400">
                                  {slot.startTime} - {slot.endTime}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 text-center">
                          <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            No weekly availability set
                          </p>
                        </div>
                      )}

                      {/* Date Overrides */}
                      {dateOverrides && dateOverrides.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Specific Date Availability
                          </h3>
                          <div className="space-y-3">
                            {dateOverrides.map((override) => (
                              <div
                                key={override.id}
                                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700 last:border-0"
                              >
                                <div className="flex items-center gap-3">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {new Date(override.date).toLocaleDateString(
                                      "en-US",
                                      {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      }
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  {override.isAvailable ? (
                                    <>
                                      <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {override.startTime} -{" "}
                                        {override.endTime}
                                      </span>
                                      <span className="px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                                        Available
                                      </span>
                                    </>
                                  ) : (
                                    <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                                      Unavailable
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Empty State - Only if no settings, availability, or overrides */}
                      {!sessionSettings &&
                        (!availability || availability.length === 0) &&
                        (!dateOverrides || dateOverrides.length === 0) && (
                          <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                            <p className="text-gray-500 dark:text-gray-400 mb-2">
                              No sessions available
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              Book 1-on-1 consultation sessions with this
                              creator
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
