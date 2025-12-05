"use client";

import { useParams, useRouter } from "next/navigation";
import { useCreators } from "@/hooks/useCreators";
import { useAgents } from "@/hooks/useAgents";
import { useCreatorStats } from "@/hooks/useProfile";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Bot,
  Star,
  Users,
  MessageSquare,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Loader2,
  XCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from "lucide-react";

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;

  const { useCreator, useFollowCreator, useUnfollowCreator, useIsFollowing } =
    useCreators();
  const { data: creator, isLoading, error } = useCreator(creatorId);
  const { data: isFollowing } = useIsFollowing(creatorId);
  const followCreator = useFollowCreator();
  const unfollowCreator = useUnfollowCreator();

  const { useAgentsByCreator } = useAgents();
  const { data: agents } = useAgentsByCreator(creatorId);

  const { data: creatorStats } = useCreatorStats(creatorId);

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        await unfollowCreator.mutateAsync(creatorId);
      } else {
        await followCreator.mutateAsync(creatorId);
      }
    } catch (error) {
      console.error("Failed to toggle follow:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Creator not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The creator you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const profileImageUrl = creator.user?.profileImageUrl;
  const displayName = creator.title || creator.user?.firstName || "Creator";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-teal-500 h-48 relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
      </div>

      {/* Profile Section */}
      <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={displayName}
                  width={120}
                  height={120}
                  className="rounded-2xl border-4 border-white dark:border-gray-800 shadow-lg"
                />
              ) : (
                <div className="w-[120px] h-[120px] rounded-2xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {creator.isAvailable && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Available
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {displayName}
                  </h1>
                  {creator.tagline && (
                    <p className="text-purple-600 dark:text-purple-400 font-medium mt-1">
                      {creator.tagline}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleFollowToggle}
                  disabled={
                    followCreator.isPending || unfollowCreator.isPending
                  }
                  className={`px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 ${
                    isFollowing
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                      : "bg-purple-600 text-white hover:bg-purple-700"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>

              {creator.bio && (
                <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                  {creator.bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-6">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {creatorStats?.followersCount || 0}
                  </span>
                  <span>followers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {agents?.length || 0}
                  </span>
                  <span>agents</span>
                </div>
                {creator.hourlyRate && creator.hourlyRate > 0 && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${creator.hourlyRate}/hr
                    </span>
                    <span>for sessions</span>
                  </div>
                )}
              </div>

              {/* Categories */}
              {creator.categories && creator.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {creator.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Agents Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-600" />
            AI Agents
          </h2>

          {agents && agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <Link
                  key={agent.id}
                  href={`/explore/agents/${agent.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {agent.description || "No description available"}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span
                          className={`text-sm font-medium ${
                            agent.pricePerMessage && agent.pricePerMessage > 0
                              ? "text-purple-600"
                              : "text-green-600"
                          }`}
                        >
                          {agent.pricePerMessage && agent.pricePerMessage > 0
                            ? `$${agent.pricePerMessage.toFixed(2)}/msg`
                            : "Free"}
                        </span>
                        {agent.category && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                            {agent.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors flex-shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
              <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                This creator hasn&apos;t published any agents yet.
              </p>
            </div>
          )}
        </div>

        {/* Book Session CTA */}
        {creator.isAvailable &&
          creator.hourlyRate &&
          creator.hourlyRate > 0 && (
            <div className="bg-gradient-to-r from-purple-600 to-teal-500 rounded-2xl p-6 mb-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-white">
                  <h3 className="text-xl font-bold">Book a 1-on-1 Session</h3>
                  <p className="text-white/80 mt-1">
                    Get personalized help from {displayName}
                  </p>
                </div>
                <Link
                  href={`/student/sessions/book/${creatorId}`}
                  className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
                >
                  <Calendar className="w-5 h-5" />
                  Book Session
                </Link>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
