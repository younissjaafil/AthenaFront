"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAgent } from "@/hooks/useAgents";
import { useAgentAccess, useCreatePayment } from "@/hooks/usePayments";
import { useFindOrCreateConversation } from "@/hooks/useConversations";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Bot,
  ArrowLeft,
  Star,
  MessageSquare,
  Sparkles,
  Lock,
  Check,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function AgentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: agent, isLoading } = useAgent(id);
  const { data: access } = useAgentAccess(id);
  const { data: currentUser } = useCurrentUser();
  const createConversation = useFindOrCreateConversation();
  const createPayment = useCreatePayment();

  const handleStartChat = async () => {
    if (!agent) return;

    // If agent is free or user has access, create conversation directly
    if (agent.isFree || access?.hasAccess) {
      try {
        const conversation = await createConversation.mutateAsync({
          agentId: agent.id,
        });
        router.push(`/student/chat/${conversation.id}`);
      } catch (error) {
        console.error("Failed to create conversation:", error);
      }
    } else {
      // Redirect to payment
      try {
        const payment = await createPayment.mutateAsync({
          agentId: agent.id,
          amount: agent.pricePerConversation || agent.pricePerMessage * 50, // Estimate 50 messages
        });
        if (payment.paymentUrl) {
          window.location.href = payment.paymentUrl;
        }
      } catch (error) {
        console.error("Failed to create payment:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Loading agent...</p>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Agent not found
          </h3>
          <Link
            href="/explore/agents"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            ← Back to agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <Link
          href="/explore/agents"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to agents
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sm:p-8"
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 dark:from-purple-600/20 to-cyan-100 dark:to-cyan-600/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-10 h-10 text-purple-500 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {agent.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {agent.isFree ? (
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <Sparkles className="w-4 h-4" />
                        Free
                      </span>
                    ) : (
                      <span className="text-gray-600 dark:text-slate-400">
                        ${agent.pricePerMessage}/message
                      </span>
                    )}
                    {agent.averageRating > 0 && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {agent.averageRating.toFixed(1)}
                      </span>
                    )}
                    {agent.totalConversations > 0 && (
                      <span className="flex items-center gap-1 text-gray-600 dark:text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                        {agent.totalConversations} chats
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  About
                </h2>
                <p className="text-gray-600 dark:text-slate-400 leading-relaxed">
                  {agent.description || "No description available"}
                </p>
              </div>

              {/* Categories & Tags */}
              {(agent.category?.length > 0 || agent.tags?.length > 0) && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Categories & Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.category?.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                    {agent.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Capabilities */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Capabilities
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>AI Model: {agent.model}</span>
                  </div>
                  {agent.useRag && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                      <Check className="w-5 h-5 text-emerald-500" />
                      <span>Enhanced with custom knowledge base</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span>Max {agent.maxTokens} tokens per response</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 sticky top-6"
            >
              {/* Action Button */}
              <button
                onClick={handleStartChat}
                disabled={
                  createConversation.isPending || createPayment.isPending
                }
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                  agent.isFree || access?.hasAccess
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600 shadow-lg shadow-purple-500/25"
                    : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {createConversation.isPending || createPayment.isPending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : agent.isFree || access?.hasAccess ? (
                  <>
                    <MessageSquare className="w-5 h-5" />
                    Start Chatting
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Get Access
                  </>
                )}
              </button>

              {/* Access Info */}
              {access?.hasAccess && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm">
                    <Check className="w-4 h-4" />
                    <span className="font-medium">You have access</span>
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400 text-sm">
                    Total Chats
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {agent.totalConversations}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-slate-400 text-sm">
                    Messages Sent
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {agent.totalMessages}
                  </span>
                </div>
                {!agent.isFree && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-slate-400 text-sm">
                      Price per Message
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${agent.pricePerMessage}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
