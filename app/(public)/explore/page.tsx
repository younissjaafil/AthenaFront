"use client";

import { useState, useEffect } from "react";
import { useVerifiedCreators, Creator } from "@/hooks/useCreators";
import {
  useFollowCreator,
  useUnfollowCreator,
  useIsFollowingCreator,
} from "@/hooks/useProfile";
import { useCurrentUser, useCompleteDiscovery } from "@/hooks/useCurrentUser";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Users,
  FileText,
  Bot,
  Video,
  Check,
  ArrowRight,
  Sparkles,
} from "lucide-react";

function CreatorCard({
  creator,
  showFollowCTA = false,
}: {
  creator: Creator;
  showFollowCTA?: boolean;
}) {
  const { isSignedIn } = useAuth();
  const { data: followingData } = useIsFollowingCreator(creator.id);
  const followCreator = useFollowCreator();
  const unfollowCreator = useUnfollowCreator();

  const isFollowing = followingData?.isFollowing || false;
  const isPending = followCreator.isPending || unfollowCreator.isPending;

  const fullName =
    creator.user?.firstName && creator.user?.lastName
      ? `${creator.user.firstName} ${creator.user.lastName}`
      : creator.title || creator.user?.email || "Creator";

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isFollowing) {
      await unfollowCreator.mutateAsync(creator.id);
    } else {
      await followCreator.mutateAsync(creator.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
    >
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-purple-600 to-teal-500" />

      <div className="p-6 -mt-12">
        {/* Avatar */}
        <div className="flex items-end justify-between mb-4">
          <div className="w-20 h-20 rounded-xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 overflow-hidden shadow-lg">
            {creator.user?.profileImageUrl ? (
              <Image
                src={creator.user.profileImageUrl}
                alt={fullName}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                {fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Follow Button */}
          {isSignedIn && showFollowCTA && (
            <button
              onClick={handleFollowClick}
              disabled={isPending}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                isFollowing
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {isPending ? (
                "..."
              ) : isFollowing ? (
                <>
                  <Check className="w-4 h-4 inline mr-1" />
                  Following
                </>
              ) : (
                "Follow"
              )}
            </button>
          )}
        </div>

        {/* Info */}
        <Link href={`/u/${creator.userId}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
            {fullName}
          </h3>
        </Link>

        {creator.title && (
          <p className="text-sm text-purple-600 dark:text-purple-400 mb-2">
            {creator.title}
          </p>
        )}

        {creator.tagline && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {creator.tagline}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {creator.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {creator.averageRating.toFixed(1)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Video className="w-3 h-3" />
            {creator.totalSessions} sessions
          </span>
        </div>

        {/* Offerings Preview */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Bot className="w-3 h-3" />
            <span>Agents</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <FileText className="w-3 h-3" />
            <span>Docs</span>
          </div>
          {creator.hourlyRate > 0 && (
            <div className="ml-auto text-sm font-semibold text-teal-600 dark:text-teal-400">
              from ${creator.hourlyRate}/hr
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const { data: creators, isLoading, error } = useVerifiedCreators();
  const { isSignedIn } = useAuth();
  const { data: currentUser } = useCurrentUser();
  const completeDiscovery = useCompleteDiscovery();

  // Track followed creators count for the "Go to Home" prompt
  const [followedCount, setFollowedCount] = useState(0);

  // Check if user is in discovery phase
  const isInDiscovery = currentUser?.needsDiscovery;

  const handleGoToHome = async () => {
    // Mark discovery as complete
    if (currentUser?.needsDiscovery) {
      await completeDiscovery.mutateAsync();
    }
    router.push("/home");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Discover Creators
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl h-80 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Discover Creators
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-red-500">Failed to load creators</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Discovery Banner for new users */}
      {isInDiscovery && (
        <div className="bg-gradient-to-r from-purple-600 to-teal-500 text-white py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">
                Follow creators you&apos;re interested in to build your
                personalized feed
              </span>
            </div>
            {currentUser?.hasCompletedDiscovery === false && (
              <button
                onClick={handleGoToHome}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              >
                Go to Home
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Discover Creators
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with experts who can teach you, answer questions, and
              share knowledge
            </p>
          </div>
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Sign in to Follow
              </button>
            </SignInButton>
          )}
        </div>

        {/* Featured Categories */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            "All",
            "AI & Tech",
            "Business",
            "Science",
            "Arts",
            "Career",
            "Health",
          ].map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                cat === "All"
                  ? "bg-purple-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Creators Grid */}
        {creators && creators.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                showFollowCTA={isSignedIn}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No creators yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Be the first to become a creator on Athena!
            </p>
            <Link href="/creator/onboarding">
              <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                Become a Creator
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
