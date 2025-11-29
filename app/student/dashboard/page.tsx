"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useConversations } from "@/hooks/useConversations";
import { usePublicAgents } from "@/hooks/useAgents";
import { ConversationStatus } from "@/lib/types/conversation";
import {
  MessageSquare,
  Bot,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Star,
  Plus,
  History,
  BookOpen,
} from "lucide-react";

export default function StudentDashboard() {
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations(ConversationStatus.ACTIVE);
  const { data: agents, isLoading: agentsLoading } = usePublicAgents();

  // Get recent conversations (last 5)
  const recentConversations = conversations?.slice(0, 5) || [];

  // Get recommended agents (free ones or top rated)
  const recommendedAgents =
    agents?.filter((a) => a.isFree || a.averageRating >= 4).slice(0, 4) || [];

  return (
    <div className="min-h-full bg-slate-950">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Welcome back! 👋
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Continue learning with AI-powered conversations
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-6"
        >
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-slate-400 text-xs sm:text-sm">
                Active Chats
              </span>
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {conversations?.length || 0}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-slate-400 text-xs sm:text-sm">
                Messages Sent
              </span>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {conversations?.reduce((acc, c) => acc + c.messageCount, 0) || 0}
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 sm:p-5">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-slate-400 text-xs sm:text-sm">Agents</span>
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {new Set(conversations?.map((c) => c.agentId)).size || 0}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Conversations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Recent Conversations
              </h2>
              {recentConversations.length > 0 && (
                <Link
                  href="/student/conversations"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {conversationsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-800/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No conversations yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start chatting with an AI agent to begin your learning journey
                </p>
                <Link
                  href="/explore/agents"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Explore Agents
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentConversations.map((conversation, index) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/student/chat/${conversation.id}`}>
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-purple-500/50 hover:bg-slate-800 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                                {conversation.agent?.name || "AI Agent"}
                              </h3>
                              <span className="text-xs text-slate-500">
                                {conversation.lastMessageAt
                                  ? new Date(
                                      conversation.lastMessageAt
                                    ).toLocaleDateString()
                                  : ""}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 truncate">
                              {conversation.title}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                {conversation.messageCount} messages
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recommended Agents Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Recommended
              </h2>
              <Link
                href="/explore/agents"
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                See all
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {agentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 bg-slate-800/50 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link href={`/explore/agents/${agent.id}`}>
                      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-3 hover:border-purple-500/50 hover:bg-slate-800 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm group-hover:text-purple-400 transition-colors truncate">
                              {agent.name}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              {agent.isFree ? (
                                <span className="text-emerald-400">Free</span>
                              ) : (
                                <span>${agent.pricePerMessage}/msg</span>
                              )}
                              {agent.averageRating > 0 && (
                                <span className="flex items-center gap-1 text-amber-400">
                                  <Star className="w-3 h-3 fill-current" />
                                  {agent.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}

                {recommendedAgents.length === 0 && (
                  <div className="text-center py-6 text-slate-500">
                    No agents available yet
                  </div>
                )}
              </div>
            )}

            {/* Quick Action */}
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-600/10 to-cyan-600/10 border border-purple-500/20">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Quick Start</span>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Browse our collection of AI agents and start learning today
              </p>
              <Link
                href="/explore/agents"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Explore Agents
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
