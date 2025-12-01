"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  ArrowLeft,
  Send,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  usePost,
  usePostComments,
  useLikePost,
  useUnlikePost,
  useCreateComment,
  useLikeComment,
  useUnlikeComment,
  useDeletePost,
  PostVisibility,
} from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useAuth } from "@clerk/nextjs";

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

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const postId = params.id as string;
  const [commentText, setCommentText] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: post, isLoading: postLoading } = usePost(postId);
  const { data: commentsData, isLoading: commentsLoading } =
    usePostComments(postId);

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const createComment = useCreateComment();
  const deletePost = useDeletePost();
  const likeComment = useLikeComment();
  const unlikeComment = useUnlikeComment();

  const handleLikeToggle = () => {
    if (!post) return;
    if (post.isLiked) {
      unlikePost.mutate(post.id);
    } else {
      likePost.mutate(post.id);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment.mutate(
      { postId, data: { content: commentText } },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  const handleDeletePost = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate(postId, {
        onSuccess: () => {
          router.push("/");
        },
      });
    }
  };

  const handleCommentLikeToggle = (commentId: string, isLiked: boolean) => {
    if (isLiked) {
      unlikeComment.mutate(commentId);
    } else {
      likeComment.mutate(commentId);
    }
  };

  if (postLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Post not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            This post may have been deleted or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="text-purple-600 hover:underline font-medium"
          >
            Return to feed
          </Link>
        </div>
      </div>
    );
  }

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
    post.creator.user.firstName && post.creator.user.lastName
      ? `${post.creator.user.firstName} ${post.creator.user.lastName}`
      : post.creator.title || "Creator";

  const isOwner = currentUser?.id === post.creator.userId;
  const comments = commentsData?.comments || [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Post
          </h1>
          <div className="w-9" /> {/* Spacer for alignment */}
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* Post Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="p-4 flex items-start justify-between">
            <Link
              href={`/${post.creator.profile?.handle || post.creator.userId}`}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {post.creator.user.profileImageUrl ? (
                  <img
                    src={post.creator.user.profileImageUrl}
                    alt={creatorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-lg">
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
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
            <div className="relative">
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
                          // Add edit functionality
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Post
                      </button>
                      <button
                        onClick={() => {
                          handleDeletePost();
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
            <div className="px-4 pb-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {post.title}
              </h2>
            </div>
          )}

          {/* Body */}
          <div className="px-4 pb-4">
            <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {post.body}
            </p>
          </div>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="space-y-2 mb-4">
              {post.media.map((media) => (
                <div key={media.id} className="relative w-full">
                  {media.type === "VIDEO" ? (
                    <video
                      src={media.s3Url}
                      poster={media.thumbnailUrl}
                      controls
                      className="w-full max-h-[600px] object-contain bg-black"
                    />
                  ) : (
                    <img
                      src={media.s3Url}
                      alt=""
                      className="w-full max-h-[600px] object-contain bg-black"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="px-4 py-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
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
          <div className="px-4 py-2 flex items-center gap-1 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleLikeToggle}
              disabled={
                likePost.isPending || unlikePost.isPending || !isSignedIn
              }
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${
                post.isLiked
                  ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${post.isLiked ? "fill-red-500" : ""}`}
              />
              <span className="text-sm font-medium">Like</span>
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Comment</span>
            </button>

            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </motion.div>

        {/* Comment Input */}
        {isSignedIn ? (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <form onSubmit={handleCommentSubmit} className="flex gap-3">
              <div className="flex-shrink-0">
                {currentUser?.profileImageUrl ? (
                  <Image
                    src={currentUser.profileImageUrl}
                    alt="Your profile"
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
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-full outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || createComment.isPending}
                  className="p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Sign in to leave a comment
            </p>
          </div>
        )}

        {/* Comments */}
        <div className="bg-white dark:bg-gray-800">
          {commentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-gray-500 dark:text-gray-400">
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {comments.map((comment) => {
                const commentAuthorName =
                  comment.author.firstName && comment.author.lastName
                    ? `${comment.author.firstName} ${comment.author.lastName}`
                    : "User";

                return (
                  <div key={comment.id} className="p-4">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0">
                        {comment.author.profileImageUrl ? (
                          <img
                            src={comment.author.profileImageUrl}
                            alt={commentAuthorName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-semibold">
                            {commentAuthorName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">
                            {commentAuthorName}
                          </p>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {comment.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 mt-1 px-4">
                          <button
                            onClick={() =>
                              handleCommentLikeToggle(
                                comment.id,
                                comment.isLiked
                              )
                            }
                            disabled={!isSignedIn}
                            className={`text-xs font-medium ${
                              comment.isLiked
                                ? "text-red-500"
                                : "text-gray-500 dark:text-gray-400"
                            } hover:underline`}
                          >
                            {comment.isLiked ? "Liked" : "Like"}
                          </button>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                          {comment.likesCount > 0 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.likesCount}{" "}
                              {comment.likesCount === 1 ? "like" : "likes"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
