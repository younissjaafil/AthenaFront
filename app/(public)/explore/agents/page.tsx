"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePublicAgents, useFreeAgents } from "@/hooks/useAgents";
import { PublicAgent } from "@/lib/types/conversation";
import { AGENT_CATEGORIES } from "@/lib/types/agent";
import Link from "next/link";
import {
  Star,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Bot,
  Crown,
  Zap,
  TrendingUp,
  Users,
} from "lucide-react";

// Agent Card Component
function AgentCard({ agent, index }: { agent: PublicAgent; index: number }) {
  const creatorName = agent.creator?.user
    ? `${agent.creator.user.firstName || ""} ${
        agent.creator.user.lastName || ""
      }`.trim() || agent.creator.title
    : agent.creator?.title || "Unknown Creator";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative"
    >
      <Link href={`/explore/agents/${agent.id}`}>
        <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Header with image */}
          <div className="relative h-32 bg-gradient-to-br from-purple-600/20 to-cyan-600/20">
            {agent.profileImageUrl ? (
              <img
                src={agent.profileImageUrl}
                alt={agent.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Bot className="w-16 h-16 text-purple-400/50" />
              </div>
            )}
            {/* Free/Premium badge */}
            <div className="absolute top-3 right-3">
              {agent.isFree ? (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Free
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors">
              {agent.name}
            </h3>
            <p className="text-sm text-slate-400 mb-3">by {creatorName}</p>

            {/* Description */}
            <p className="text-sm text-slate-300 mb-4 line-clamp-2 min-h-[2.5rem]">
              {agent.description || "No description available"}
            </p>

            {/* Categories */}
            {agent.category && agent.category.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {agent.category.slice(0, 2).map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 rounded-md text-xs bg-slate-700/50 text-slate-300 border border-slate-600/50"
                  >
                    {cat}
                  </span>
                ))}
                {agent.category.length > 2 && (
                  <span className="px-2 py-0.5 rounded-md text-xs bg-slate-700/50 text-slate-400">
                    +{agent.category.length - 2}
                  </span>
                )}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <MessageSquare className="w-4 h-4" />
                  <span>{agent.totalConversations || 0}</span>
                </div>
                {agent.averageRating > 0 && (
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{agent.averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {!agent.isFree && (
                <span className="text-slate-400">
                  ${agent.pricePerMessage}/msg
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Category filter pills
function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selected === null
            ? "bg-purple-600 text-white"
            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
        }`}
      >
        All
      </button>
      {AGENT_CATEGORIES.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            selected === category
              ? "bg-purple-600 text-white"
              : "bg-slate-800 text-slate-300 hover:bg-slate-700"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const { data: agents, isLoading, error } = usePublicAgents();

  // Filter agents
  const filteredAgents = agents?.filter((agent) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        agent.name.toLowerCase().includes(query) ||
        agent.description?.toLowerCase().includes(query) ||
        agent.category?.some((c) => c.toLowerCase().includes(query)) ||
        agent.tags?.some((t) => t.toLowerCase().includes(query));
      if (!matchesSearch) return false;
    }

    // Category filter
    if (selectedCategory) {
      if (!agent.category?.includes(selectedCategory)) return false;
    }

    // Free filter
    if (showFreeOnly && !agent.isFree) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Discover AI Agents
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Explore{" "}
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Athena
              </span>{" "}
              Agents
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
              Find the perfect AI agent to help you learn, create, and grow.
              Each agent is trained with specialized knowledge.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search agents by name, category, or skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFreeOnly(!showFreeOnly)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showFreeOnly
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <Zap className="w-4 h-4" />
                Free Only
              </button>
            </div>
            <div className="text-slate-400 text-sm">
              {filteredAgents?.length || 0} agents found
            </div>
          </div>

          {/* Category Pills */}
          <CategoryFilter
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-slate-800/50 rounded-2xl h-80 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
              <MessageSquare className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Failed to load agents
            </h3>
            <p className="text-slate-400">
              Please try again later or refresh the page.
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredAgents?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
              <Bot className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No agents found
            </h3>
            <p className="text-slate-400">
              Try adjusting your search or filters.
            </p>
          </motion.div>
        )}

        {/* Agents Grid */}
        {!isLoading &&
          !error &&
          filteredAgents &&
          filteredAgents.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredAgents.map((agent, index) => (
                  <AgentCard key={agent.id} agent={agent} index={index} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-purple-600/10 to-purple-600/5 rounded-2xl border border-purple-500/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20 mb-4">
              <Bot className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {agents?.length || 0}+
            </div>
            <div className="text-slate-400">AI Agents</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-600/10 to-cyan-600/5 rounded-2xl border border-cyan-500/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-500/20 mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">1000+</div>
            <div className="text-slate-400">Active Users</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-600/5 rounded-2xl border border-emerald-500/20 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20 mb-4">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">50K+</div>
            <div className="text-slate-400">Conversations</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
