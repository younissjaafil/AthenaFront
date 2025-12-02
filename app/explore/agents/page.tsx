"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePublicAgents, useFreeAgents } from "@/hooks/useAgents";
import {
  Bot,
  Search,
  Star,
  TrendingUp,
  Sparkles,
  Filter,
  ArrowRight,
} from "lucide-react";

export default function ExploreAgentsPage() {
  const { data: allAgents, isLoading } = usePublicAgents();
  const { data: freeAgents } = useFreeAgents();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");

  const filteredAgents = allAgents?.filter((agent) => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "free" && agent.isFree) ||
      (filter === "premium" && !agent.isFree);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Explore AI Agents
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            Discover powerful AI assistants to help you learn and grow
          </p>
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 space-y-4"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-500 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
              }`}
            >
              All Agents
            </button>
            <button
              onClick={() => setFilter("free")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "free"
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setFilter("premium")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "premium"
                  ? "bg-amber-500 text-white"
                  : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700"
              }`}
            >
              Premium
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Agents Grid */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredAgents?.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/explore/agents/${agent.id}`}>
                  <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 hover:border-purple-300 dark:hover:border-purple-500 hover:shadow-lg transition-all group h-full flex flex-col">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-100 dark:from-purple-600/20 to-cyan-100 dark:to-cyan-600/20 flex items-center justify-center mb-4">
                      <Bot className="w-8 h-8 text-purple-500 dark:text-purple-400" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                        {agent.description || "No description available"}
                      </p>

                      {/* Categories */}
                      {agent.category && agent.category.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {agent.category.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className="px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700 text-xs text-gray-600 dark:text-slate-400"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-3 text-sm">
                        {agent.isFree ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Sparkles className="w-4 h-4" />
                            Free
                          </span>
                        ) : (
                          <span className="text-gray-600 dark:text-slate-400">
                            ${agent.pricePerMessage}/msg
                          </span>
                        )}
                        {agent.averageRating > 0 && (
                          <span className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-current" />
                            {agent.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <ArrowRight className="w-5 h-5 text-purple-500 dark:text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredAgents?.length === 0 && (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              No agents found
            </h3>
            <p className="text-gray-600 dark:text-slate-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
