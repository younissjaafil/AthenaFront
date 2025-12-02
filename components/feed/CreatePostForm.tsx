"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Image as ImageIcon,
  Video,
  Globe,
  Users,
  Lock,
  X,
  Loader2,
  Send,
} from "lucide-react";
import { PostVisibility, useCreatePost } from "@/hooks/useFeed";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CreatePostFormProps {
  onSuccess?: () => void;
}

export function CreatePostForm({ onSuccess }: CreatePostFormProps) {
  const { data: currentUser } = useCurrentUser();
  const createPost = useCreatePost();

  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<PostVisibility>(
    PostVisibility.PUBLIC
  );
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    try {
      await createPost.mutateAsync({
        title: title.trim() || undefined,
        body: body.trim(),
        visibility,
      });
      setBody("");
      setTitle("");
      setIsExpanded(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create post:", error);
    }
  };

  const visibilityOptions = [
    {
      value: PostVisibility.PUBLIC,
      label: "Public",
      icon: <Globe className="w-4 h-4" />,
      description: "Anyone can see this post",
    },
    {
      value: PostVisibility.FOLLOWERS,
      label: "Followers",
      icon: <Users className="w-4 h-4" />,
      description: "Only your followers can see this",
    },
    {
      value: PostVisibility.SUBSCRIBERS,
      label: "Subscribers",
      icon: <Lock className="w-4 h-4" />,
      description: "Only paying subscribers can see this",
    },
  ];

  const selectedVisibility = visibilityOptions.find(
    (opt) => opt.value === visibility
  );

  return (
    <motion.div
      layout
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
            {currentUser?.profileImageUrl ? (
              <img
                src={currentUser.profileImageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white font-semibold">
                {currentUser?.firstName?.charAt(0) ||
                  currentUser?.username?.charAt(0) ||
                  "U"}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex-1">
            {isExpanded && (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add a title (optional)"
                className="w-full mb-2 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            )}
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              placeholder="What's on your mind?"
              rows={isExpanded ? 4 : 2}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />

            {/* Actions */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {/* Media buttons - placeholder for now */}
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    title="Add image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    title="Add video"
                  >
                    <Video className="w-5 h-5" />
                  </button>

                  {/* Visibility Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      {selectedVisibility?.icon}
                      <span>{selectedVisibility?.label}</span>
                    </button>

                    {showVisibilityMenu && (
                      <div className="absolute bottom-full left-0 mb-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                        {visibilityOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                              setVisibility(option.value);
                              setShowVisibilityMenu(false);
                            }}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-start gap-3 ${
                              visibility === option.value
                                ? "bg-purple-50 dark:bg-purple-900/20"
                                : ""
                            }`}
                          >
                            <div
                              className={`mt-0.5 ${
                                visibility === option.value
                                  ? "text-purple-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {option.icon}
                            </div>
                            <div>
                              <p
                                className={`font-medium ${
                                  visibility === option.value
                                    ? "text-purple-600"
                                    : "text-gray-900 dark:text-white"
                                }`}
                              >
                                {option.label}
                              </p>
                              <p className="text-xs text-gray-500">
                                {option.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      setBody("");
                      setTitle("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!body.trim() || createPost.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                  >
                    {createPost.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Post
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </form>
    </motion.div>
  );
}
