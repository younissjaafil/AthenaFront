"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Lock,
  Users,
  Globe,
  Pin,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import Link from "next/link";
import {
  Post,
  PostVisibility,
  useLikePost,
  useUnlikePost,
} from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";

// Simple relative time formatter
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

interface PostCardProps {
  post: Post;
  onDelete?: (postId: string) => void;
  onEdit?: (post: Post) => void;
}

export function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const { data: currentUser } = useCurrentUser();
  const [showMenu, setShowMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  const isOwner = currentUser?.id === post.creator.userId;

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleLikeToggle = () => {
    setError(null);
    if (post.isLiked) {
      unlikePost.mutate(post.id, {
        onError: () => {
          setError("Failed to unlike post");
          setTimeout(() => setError(null), 3000);
        },
      });
    } else {
      likePost.mutate(post.id, {
        onError: () => {
          setError("Failed to like post");
          setTimeout(() => setError(null), 3000);
        },
      });
    }
  };

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case PostVisibility.PUBLIC:
        return <Globe className="w-3 h-3" />;
      case PostVisibility.FOLLOWERS:
        return <Users className="w-3 h-3" />;
      case PostVisibility.SUBSCRIBERS:
        return <Lock className="w-3 h-3" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (post.visibility) {
      case PostVisibility.PUBLIC:
        return "Public";
      case PostVisibility.FOLLOWERS:
        return "Followers";
      case PostVisibility.SUBSCRIBERS:
        return "Subscribers";
    }
  };

  const creatorName =
    post.creator.profile?.displayName ||
    (post.creator.user.firstName && post.creator.user.lastName
      ? `${post.creator.user.firstName} ${post.creator.user.lastName}`
      : post.creator.user.firstName || post.creator.title || "User");

  const creatorHandle =
    post.creator.profile?.handle || `user_${post.creator.userId}`;
  const creatorAvatar =
    post.creator.profile?.avatarUrl || post.creator.user.profileImageUrl;

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("video") ||
      target.closest("input")
    ) {
      return;
    }
    window.location.href = `/post/${post.id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handlePostClick}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
    >
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-2">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
      {/* Header */}
      <div className="p-5 flex items-start justify-between">
        <Link
          href={`/${creatorHandle}`}
          className="flex items-start gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 ring-2 ring-gray-100 dark:ring-gray-700">
            {creatorAvatar ? (
              <img
                src={creatorAvatar}
                alt={creatorName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold">
                {creatorName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900 dark:text-white hover:underline">
                {creatorName}
              </span>
              {post.isPinned && (
                <Pin className="w-3 h-3 text-purple-500 fill-purple-500" />
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>@{creatorHandle}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                {getVisibilityIcon()}
                <span>{getVisibilityLabel()}</span>
              </div>
            </div>
          </div>
        </Link>

        {/* Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              {isOwner && (
                <>
                  <button
                    onClick={() => {
                      onEdit?.(post);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Post
                  </button>
                  <button
                    onClick={() => {
                      onDelete?.(post.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Post
                  </button>
                </>
              )}
              <button
                onClick={() => setShowMenu(false)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      {post.title && (
        <div className="px-5 pb-3">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {post.title}
          </h3>
        </div>
      )}

      {/* Body */}
      <div className="px-5 pb-4">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {post.body}
        </p>
      </div>

      {/* Media */}
      {post.media && post.media.length > 0 && (
        <div
          className={`grid gap-1 ${
            post.media.length === 1
              ? "grid-cols-1"
              : post.media.length === 2
              ? "grid-cols-2"
              : post.media.length === 3
              ? "grid-cols-2"
              : "grid-cols-2"
          }`}
        >
          {post.media.slice(0, 4).map((media, index) => (
            <div
              key={media.id}
              className={`relative aspect-square ${
                post.media.length === 3 && index === 0 ? "row-span-2" : ""
              }`}
            >
              {media.type === "VIDEO" ? (
                <video
                  src={media.s3Url}
                  poster={media.thumbnailUrl}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={media.s3Url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
              {post.media.length > 4 && index === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    +{post.media.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="px-5 py-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {post.viewsCount}
        </span>
        {post.likesCount > 0 && (
          <span>
            {post.likesCount} {post.likesCount === 1 ? "like" : "likes"}
          </span>
        )}
        {post.commentsCount > 0 && (
          <span>
            {post.commentsCount}{" "}
            {post.commentsCount === 1 ? "comment" : "comments"}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={handleLikeToggle}
          disabled={likePost.isPending || unlikePost.isPending}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg transition-all duration-200 ${
            post.isLiked
              ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-200 ${
              post.isLiked ? "fill-red-500 scale-110" : ""
            }`}
          />
          <span className="text-sm font-medium">Like</span>
        </button>

        <Link
          href={`/post/${post.id}`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </Link>

        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200">
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </motion.div>
  );
}
