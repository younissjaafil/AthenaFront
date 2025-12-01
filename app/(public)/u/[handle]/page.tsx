"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  useProfile,
  useFollowUser,
  useUnfollowUser,
  useTestimonials,
  useTestimonialStats,
} from "@/hooks/useProfile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { AnimatedCard } from "@/components/ui/animated-card";
import {
  User,
  MapPin,
  Link as LinkIcon,
  Twitter,
  Linkedin,
  Github,
  Instagram,
  Youtube,
  Star,
  Users,
  FileText,
  Video,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";

type TabType = "agents" | "documents" | "sessions";

export default function ProfilePage() {
  const params = useParams();
  const handle = params.handle as string;
  const [activeTab, setActiveTab] = useState<TabType>("agents");

  const { data: currentUser } = useCurrentUser();
  const { data: profile, isLoading } = useProfile(handle);
  const { data: testimonials } = useTestimonials(
    profile?.creatorId || "",
    1,
    3
  );
  const { data: stats } = useTestimonialStats(profile?.creatorId || "");

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();

  const isOwnProfile = currentUser?.id === profile?.userId;
  const isCreator = !!profile?.creatorId;

  const handleFollowToggle = async () => {
    if (!profile) return;
    if (profile.isFollowing) {
      await unfollowUser.mutateAsync(profile.userId);
    } else {
      await followUser.mutateAsync(profile.userId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile not found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          User @{handle} does not exist
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Banner */}
      <div
        className="h-64 bg-gradient-to-r from-purple-600 to-teal-600"
        style={{
          backgroundImage: profile.bannerUrl
            ? `url(${profile.bannerUrl})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="max-w-5xl mx-auto px-4 -mt-20">
        {/* Profile Header */}
        <AnimatedCard className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-700">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.displayName || handle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {profile.displayName || `@${handle}`}
                    </h1>
                    {profile.isVerified && (
                      <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                        <Check className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    @{handle}
                  </p>
                  {profile.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {!isOwnProfile && currentUser && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followUser.isPending || unfollowUser.isPending}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      profile.isFollowing
                        ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {followUser.isPending || unfollowUser.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : profile.isFollowing ? (
                      "Following"
                    ) : (
                      "Follow"
                    )}
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex gap-6 mb-4">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {profile.followerCount}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    Followers
                  </span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {profile.followingCount}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400 ml-1">
                    Following
                  </span>
                </div>
                {isCreator && (
                  <>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {profile.agentCount || 0}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        Agents
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {profile.sessionCount || 0}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        Sessions
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-3">
                {profile.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </a>
                )}
                {profile.twitterUrl && (
                  <a
                    href={profile.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                )}
                {profile.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {profile.youtubeUrl && (
                  <a
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </AnimatedCard>

        {/* Creator Content Tabs */}
        {isCreator && (
          <>
            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-6">
              {(["agents", "documents", "sessions"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "agents" && <Users className="w-4 h-4" />}
                  {tab === "documents" && <FileText className="w-4 h-4" />}
                  {tab === "sessions" && <Video className="w-4 h-4" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === "agents" && (
                <AnimatedCard className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Agents coming soon...
                  </p>
                </AnimatedCard>
              )}
              {activeTab === "documents" && (
                <AnimatedCard className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Documents coming soon...
                  </p>
                </AnimatedCard>
              )}
              {activeTab === "sessions" && (
                <AnimatedCard className="p-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Sessions coming soon...
                  </p>
                </AnimatedCard>
              )}
            </div>
          </>
        )}

        {/* Testimonials Section (for creators) */}
        {isCreator && testimonials && testimonials.testimonials.length > 0 && (
          <AnimatedCard className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Testimonials
              </h2>
              {stats && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {stats.averageRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({stats.totalCount} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {testimonials.testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {testimonial.author?.avatarUrl ? (
                        <img
                          src={testimonial.author.avatarUrl}
                          alt={testimonial.author.displayName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {testimonial.author?.displayName}
                        </p>
                        <div className="flex">
                          {Array.from({ length: testimonial.rating }).map(
                            (_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-500 fill-yellow-500"
                              />
                            )
                          )}
                        </div>
                      </div>
                      {testimonial.text && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {testimonial.text}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
}
