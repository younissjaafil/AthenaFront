"use client";

import { motion } from "framer-motion";
import { Bot, Lock, MessageCircle, Star, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { CreatorAgent } from "@/hooks/useCreators";

interface AgentsTabProps {
  agents: CreatorAgent[];
  isLoading: boolean;
  creatorId: string;
}

export function AgentsTab({ agents, isLoading, creatorId }: AgentsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (!agents || agents.length === 0) {
    return (
      <div className="text-center py-12">
        <Bot className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Agents Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This creator hasn&apos;t published any agents yet.
        </p>
      </div>
    );
  }

  // Split agents into free and premium
  const freeAgents = agents.filter((agent) => agent.isFree);
  const premiumAgents = agents.filter((agent) => !agent.isFree);

  return (
    <div className="space-y-8">
      {/* Free Agents Section */}
      {freeAgents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Free Agents
            </h3>
            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              {freeAgents.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Agents Section */}
      {premiumAgents.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Premium Agents
            </h3>
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              {premiumAgents.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumAgents.map((agent, index) => (
              <AgentCard key={agent.id} agent={agent} index={index} isPremium />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface AgentCardProps {
  agent: CreatorAgent;
  index: number;
  isPremium?: boolean;
}

function AgentCard({ agent, index, isPremium }: AgentCardProps) {
  const price =
    agent.pricePerConversation > 0
      ? agent.pricePerConversation
      : agent.pricePerMessage;
  const priceLabel =
    agent.pricePerConversation > 0 ? "per conversation" : "per message";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/chat/${agent.id}`}>
        <div
          className={`group relative p-5 rounded-xl border transition-all hover:shadow-lg ${
            isPremium
              ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }`}
        >
          {/* Premium Badge */}
          {isPremium && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
                <Lock className="w-3 h-3" />
                Premium
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {/* Agent Avatar */}
            <div
              className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center ${
                isPremium
                  ? "bg-purple-100 dark:bg-purple-800/50"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {agent.profileImageUrl ? (
                <img
                  src={agent.profileImageUrl}
                  alt={agent.name}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <Bot
                  className={`w-7 h-7 ${
                    isPremium
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                />
              )}
            </div>

            {/* Agent Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                {agent.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                {agent.description || "No description provided"}
              </p>

              {/* Stats Row */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{agent.totalConversations || 0}</span>
                </div>
                {agent.averageRating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span>{agent.averageRating.toFixed(1)}</span>
                  </div>
                )}
                {agent.category && agent.category.length > 0 && (
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400">
                    {agent.category[0]}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price / CTA Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
            {isPremium ? (
              <>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {priceLabel}
                  </span>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Zap className="w-3.5 h-3.5" />
                  Unlock
                </button>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Free to chat
                </span>
                <span className="text-sm text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  Start chatting →
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
