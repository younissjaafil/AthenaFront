"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { useCreatorPosts, Post } from "@/hooks/useFeed";
import { PostCard } from "./PostCard";

interface PostsTabProps {
  creatorId: string;
  creatorName?: string;
}

export function PostsTab({ creatorId, creatorName }: PostsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useCreatorPosts(creatorId, page, 20);

  if (isLoading && page === 1) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load posts</p>
      </div>
    );
  }

  if (!data || data.posts.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Posts Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {creatorName || "This creator"} hasn&apos;t posted anything yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {data.hasMore && (
        <div className="text-center py-4">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={isLoading}
            className="px-6 py-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </span>
            ) : (
              "Load More"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
