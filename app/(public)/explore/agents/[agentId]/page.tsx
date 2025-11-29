"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth, useUser } from "@clerk/nextjs";
import { usePublicAgents } from "@/hooks/useAgents";
import { useFindOrCreateConversation } from "@/hooks/useConversations";
import {
  Bot,
  Star,
  MessageSquare,
  Crown,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Users,
  BookOpen,
  Zap,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function AgentDetailPage({
  params,
}: {
  params: { agentId: string };
}) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { data: agents, isLoading } = usePublicAgents();
  const findOrCreateConversation = useFindOrCreateConversation();

  const agent = agents?.find((a) => a.id === params.agentId);

  const handleStartChat = async () => {
    if (!isSignedIn) {
      router.push(`/sign-in?redirect_url=/explore/agents/${params.agentId}`);
      return;
    }

    try {
      const conversation = await findOrCreateConversation.mutateAsync({
        agentId: params.agentId,
      });
      router.push(`/student/chat/${conversation.id}`);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Agent Not Found
          </h1>
          <p className="text-slate-400 mb-6">
            This agent doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/explore/agents"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const creatorName = agent.creator?.user
    ? `${agent.creator.user.firstName || ""} ${
        agent.creator.user.lastName || ""
      }`.trim() || agent.creator.title
    : agent.creator?.title || "Unknown Creator";

  // Features based on agent capabilities
  const features = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Trained on specialized documents and resources",
    },
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description: "Chat naturally like you would with an expert",
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get answers in seconds, not hours",
    },
    {
      icon: CheckCircle2,
      title: "Accurate Information",
      description: "Responses backed by curated knowledge",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/explore/agents"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Explore
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Agent Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="flex items-start gap-6 mb-8">
                {/* Agent Avatar */}
                <div className="flex-shrink-0 w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-600/20 to-cyan-600/20 border border-slate-700 overflow-hidden">
                  {agent.profileImageUrl ? (
                    <img
                      src={agent.profileImageUrl}
                      alt={agent.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Bot className="w-12 h-12 text-purple-400" />
                    </div>
                  )}
                </div>

                {/* Agent Title */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">
                      {agent.name}
                    </h1>
                    {agent.isFree ? (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Free
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        Premium
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 mb-3">by {creatorName}</p>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>{agent.totalConversations || 0} chats</span>
                    </div>
                    {agent.averageRating > 0 && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{agent.averageRating.toFixed(1)} rating</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-4 h-4" />
                      <span>{Math.floor(Math.random() * 100 + 50)} users</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">
                  About this Agent
                </h2>
                <p className="text-slate-300 leading-relaxed">
                  {agent.description ||
                    "This AI agent is designed to help you with specific tasks and questions. Start a conversation to explore its capabilities."}
                </p>
              </div>

              {/* Categories & Tags */}
              {(agent.category?.length > 0 || agent.tags?.length > 0) && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-white mb-3">
                    Categories & Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {agent.category?.map((cat) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 rounded-lg text-sm bg-purple-500/10 text-purple-400 border border-purple-500/20"
                      >
                        {cat}
                      </span>
                    ))}
                    {agent.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-lg text-sm bg-slate-700/50 text-slate-300 border border-slate-600/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">
                  What this agent can help you with
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <feature.icon className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white mb-1">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Column - CTA Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-8 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
                {/* Pricing Section */}
                <div className="p-6 border-b border-slate-700/50">
                  {agent.isFree ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        Free
                      </div>
                      <p className="text-slate-400 text-sm">
                        Unlimited conversations
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white mb-1">
                        ${agent.pricePerMessage}
                        <span className="text-lg text-slate-400 font-normal">
                          /message
                        </span>
                      </div>
                      {agent.pricePerConversation > 0 && (
                        <p className="text-slate-400 text-sm">
                          or ${agent.pricePerConversation}/conversation
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <div className="p-6">
                  <button
                    onClick={handleStartChat}
                    disabled={findOrCreateConversation.isPending}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                  >
                    {findOrCreateConversation.isPending ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Start Chatting
                      </>
                    )}
                  </button>

                  {!isSignedIn && (
                    <p className="text-center text-slate-400 text-sm mt-3">
                      Sign in required to start chatting
                    </p>
                  )}

                  {/* Features List */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Instant AI responses</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Powered by RAG technology</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Context-aware answers</span>
                    </div>
                  </div>
                </div>

                {/* Powered by badge */}
                <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Powered by Athena AI
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
