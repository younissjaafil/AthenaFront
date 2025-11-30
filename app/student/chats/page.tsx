"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useConversations,
  useDeleteConversation,
} from "@/hooks/useConversations";
import { ConversationStatus } from "@/lib/types/conversation";
import {
  MessageSquare,
  Bot,
  Trash2,
  Clock,
  ChevronRight,
  Plus,
  Search,
  Loader2,
  MessageCircle,
  Sparkles,
  Archive,
  MoreVertical,
  X,
} from "lucide-react";

export default function ChatsPage() {
  const router = useRouter();
  const { data: conversations, isLoading } = useConversations();
  const deleteConversation = useDeleteConversation();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all");

  const filteredConversations = conversations?.filter((conv) => {
    // Never show deleted conversations
    if (conv.status === ConversationStatus.DELETED) return false;

    // Filter by status
    if (filter === "active" && conv.status !== ConversationStatus.ACTIVE)
      return false;
    if (filter === "archived" && conv.status !== ConversationStatus.ARCHIVED)
      return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const title = (conv.title || conv.agent?.name || "").toLowerCase();
      const agentName = (conv.agent?.name || "").toLowerCase();
      return title.includes(query) || agentName.includes(query);
    }
    return true;
  });

  const handleDelete = async (conversationId: string) => {
    try {
      await deleteConversation.mutateAsync(conversationId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-purple-500" />
              My Chats
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Continue your conversations or start a new one
            </p>
          </div>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Link>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "active", "archived"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversations List */}
      {filteredConversations && filteredConversations.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredConversations.map((conversation, index) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all hover:shadow-lg"
              >
                <Link
                  href={`/student/chat/${conversation.id}`}
                  className="block p-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Agent Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {conversation.title ||
                              conversation.agent?.name ||
                              "Untitled Chat"}
                          </h3>
                          <p className="text-sm text-purple-600 dark:text-purple-400">
                            {conversation.agent?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          {formatDate(
                            conversation.lastMessageAt || conversation.createdAt
                          )}
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {conversation.messageCount} messages
                        </span>
                        {conversation.status ===
                          ConversationStatus.ARCHIVED && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Archive className="w-4 h-4" />
                            Archived
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </div>
                </Link>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteConfirm(conversation.id);
                  }}
                  className="absolute top-4 right-12 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {deleteConfirm === conversation.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm flex items-center justify-center gap-3 p-4"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Delete this chat?
                      </p>
                      <button
                        onClick={() => handleDelete(conversation.id)}
                        disabled={deleteConversation.isPending}
                        className="px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50"
                      >
                        {deleteConversation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Delete"
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {searchQuery ? "No chats found" : "No conversations yet"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            {searchQuery
              ? "Try a different search term"
              : "Start chatting with an AI agent to see your conversation history here"}
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-5 h-5" />
            Explore Agents
          </Link>
        </motion.div>
      )}
    </div>
  );
}
