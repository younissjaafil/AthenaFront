"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Settings,
  Edit,
  Link as LinkIcon,
  Grid3X3,
  Bookmark,
  Heart,
  MessageSquare,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "likes">(
    "posts"
  );
  const isCreator = currentUser?.isCreator || currentUser?.isAdmin;

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-800" />
        <div className="px-4 pb-4">
          <div className="relative">
            <div className="absolute -top-12 left-0 w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-gray-950" />
          </div>
          <div className="pt-14 space-y-2">
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 relative">
        <button className="absolute top-2 right-2 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors">
          <Edit className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="relative flex justify-between">
          {/* Avatar */}
          <div className="relative -mt-12">
            {currentUser?.profileImageUrl ? (
              <Image
                src={currentUser.profileImageUrl}
                alt="Profile"
                width={96}
                height={96}
                className="rounded-full border-4 border-white dark:border-gray-950 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 border-4 border-white dark:border-gray-950 flex items-center justify-center text-white text-2xl font-bold">
                {currentUser?.firstName?.[0] ||
                  currentUser?.username?.[0] ||
                  "U"}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-start gap-2 mt-3">
            <Link href="/student/settings">
              <button className="p-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </Link>
            <button className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
              Edit profile
            </button>
          </div>
        </div>

        {/* Name & Username */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            {isCreator && (
              <span className="px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-700 rounded-full">
                Creator
              </span>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            @{currentUser?.username || "user"}
          </p>
        </div>

        {/* Bio */}
        <p className="mt-3 text-gray-700 dark:text-gray-300">
          Learning and growing every day 🚀
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">0</strong>{" "}
            Following
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">0</strong>{" "}
            Followers
          </span>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-full transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Student Dashboard
          </Link>
          {isCreator && (
            <Link
              href="/creator/dashboard"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-950 rounded-full transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Creator Studio
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("posts")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "posts"
              ? "text-[#00AFF0] border-b-2 border-[#00AFF0]"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Grid3X3 className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab("media")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "media"
              ? "text-[#00AFF0] border-b-2 border-[#00AFF0]"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Bookmark className="w-4 h-4 mx-auto" />
        </button>
        <button
          onClick={() => setActiveTab("likes")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${
            activeTab === "likes"
              ? "text-[#00AFF0] border-b-2 border-[#00AFF0]"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
        >
          <Heart className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* Content */}
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          {activeTab === "posts" && "No posts yet"}
          {activeTab === "media" && "No saved items yet"}
          {activeTab === "likes" && "No liked posts yet"}
        </p>
      </div>
    </div>
  );
}
