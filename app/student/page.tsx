"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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
  BookOpen,
  Loader2,
} from "lucide-react";

export default function StudentPage() {
  const router = useRouter();
  const { data: conversations, isLoading: conversationsLoading } =
    useConversations(ConversationStatus.ACTIVE);
  const { data: agents, isLoading: agentsLoading } = usePublicAgents();

  // Auto-redirect to dashboard after a brief moment
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/student/dashboard");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  const activeChatsCount = conversations?.length || 0;
  const totalMessages = conversations?.reduce((acc, c) => acc + c.messageCount, 0) || 0;
  const uniqueAgents = new Set(conversations?.map((c) => c.agentId)).size || 0;
  const recommendedAgents = agents?.filter((a) => a.isFree || a.averageRating >= 4).slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gradient-to-br from-purple-600 to-cyan-600 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to Student Studio
            </h1>
            <p className="text-white/90">
              Your AI-powered learning hub
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Quick Stats */}
            {!conversationsLoading && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center border border-purple-200 dark:border-purple-500/20">
                  <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {activeChatsCount}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Active Chats
                  </p>
                </div>
                <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 text-center border border-cyan-200 dark:border-cyan-500/20">
                  <TrendingUp className="w-6 h-6 text-cyan-600 dark:text-cyan-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalMessages}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Messages
                  </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center border border-emerald-200 dark:border-emerald-500/20">
                  <Bot className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {uniqueAgents}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Agents
                  </p>
                </div>
              </div>
            )}

            {/* Recommended Agents */}
            {!agentsLoading && recommendedAgents.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Recommended Agents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedAgents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/explore/agents/${agent.id}`}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {agent.name}
                        </p>
                      </div>
                      {agent.isFree && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                          Free
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/student/dashboard"
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold transition-all shadow-lg shadow-purple-500/20"
              >
                <BookOpen className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/explore/agents"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Explore Agents
              </Link>
            </div>

            {/* Redirect Notice */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Redirecting to dashboard...</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
