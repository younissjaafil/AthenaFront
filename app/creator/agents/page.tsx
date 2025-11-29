"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMyAgents, useDeleteAgent } from "@/hooks/useAgents";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-card";
import {
  VisibilityBadge,
  StatusBadge,
  PricingBadge,
} from "@/components/ui/badge";
import type { Agent, AgentStatus, AgentVisibility } from "@/lib/types/agent";
import { AI_MODEL_DISPLAY } from "@/lib/types/agent";

type ViewMode = "grid" | "table";
type FilterStatus = AgentStatus | "all";
type FilterVisibility = AgentVisibility | "all";

export default function AgentsPage() {
  const { data: agents, isLoading, error, refetch } = useMyAgents();
  const deleteAgent = useDeleteAgent();

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterVisibility, setFilterVisibility] =
    useState<FilterVisibility>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter agents
  const filteredAgents = agents?.filter((agent) => {
    if (filterStatus !== "all" && agent.status !== filterStatus) return false;
    if (filterVisibility !== "all" && agent.visibility !== filterVisibility)
      return false;
    if (
      searchQuery &&
      !agent.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleDelete = async (agentId: string) => {
    try {
      await deleteAgent.mutateAsync(agentId);
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete agent:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Agents
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and configure your AI assistants
          </p>
        </div>
        <Link
          href="/creator/agents/new"
          className="btn-primary inline-flex items-center gap-2 self-start"
        >
          <span className="text-lg">+</span>
          Create New Agent
        </Link>
      </motion.div>

      {/* Filters & Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-border-light dark:border-gray-800"
      >
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500 dark:focus:ring-brand-purple-400 w-64"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Visibility Filter */}
          <select
            value={filterVisibility}
            onChange={(e) =>
              setFilterVisibility(e.target.value as FilterVisibility)
            }
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple-500"
          >
            <option value="all">All Visibility</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === "table"
                ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            Table
          </button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-6 text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">
            Failed to load agents. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="text-sm text-red-600 dark:text-red-400 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAgents?.length === 0 && (
        <EmptyState
          hasFilters={
            filterStatus !== "all" ||
            filterVisibility !== "all" ||
            searchQuery !== ""
          }
        />
      )}

      {/* Grid View */}
      {!isLoading &&
        !error &&
        filteredAgents &&
        filteredAgents.length > 0 &&
        viewMode === "grid" && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentGridCard
                key={agent.id}
                agent={agent}
                onDelete={() => setDeleteConfirm(agent.id)}
              />
            ))}
          </StaggerContainer>
        )}

      {/* Table View */}
      {!isLoading &&
        !error &&
        filteredAgents &&
        filteredAgents.length > 0 &&
        viewMode === "table" && (
          <AgentsTable
            agents={filteredAgents}
            onDelete={(id) => setDeleteConfirm(id)}
          />
        )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteModal
            onConfirm={() => handleDelete(deleteConfirm)}
            onCancel={() => setDeleteConfirm(null)}
            isDeleting={deleteAgent.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Grid Card Component
function AgentGridCard({
  agent,
  onDelete,
}: {
  agent: Agent;
  onDelete: () => void;
}) {
  return (
    <StaggerItem className="group relative">
      <Link href={`/creator/agents/${agent.id}/edit`} className="block">
        {/* Avatar and Name */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-purple-500 to-brand-teal-500 flex items-center justify-center text-white text-xl font-semibold shadow-lg">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-brand-purple-600 dark:group-hover:text-brand-purple-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {agent.category}
              </p>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {agent.tagline || agent.description}
        </p>

        {/* Model */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Model: {AI_MODEL_DISPLAY[agent.model] || agent.model}
        </p>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <VisibilityBadge visibility={agent.visibility} />
          <StatusBadge status={agent.status} />
          <PricingBadge isFree={agent.isFree} price={agent.pricePerMonth} />
        </div>

        {/* Stats */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>{agent.totalConversations} chats</span>
            {agent.averageRating > 0 && (
              <span>⭐ {agent.averageRating.toFixed(1)}</span>
            )}
          </div>
          <span>{new Date(agent.updatedAt).toLocaleDateString()}</span>
        </div>
      </Link>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          onDelete();
        }}
        className="absolute top-4 right-4 p-2 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-900/50"
      >
        🗑️
      </button>
    </StaggerItem>
  );
}

// Table View Component
function AgentsTable({
  agents,
  onDelete,
}: {
  agents: Agent[];
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-gray-900 rounded-xl border border-border-light dark:border-gray-800 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Agent
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Visibility
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Pricing
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Conversations
              </th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Updated
              </th>
              <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent, index) => (
              <motion.tr
                key={agent.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <Link
                    href={`/creator/agents/${agent.id}/edit`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple-500 to-brand-teal-500 flex items-center justify-center text-white font-semibold">
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white group-hover:text-brand-purple-600 dark:group-hover:text-brand-purple-400 transition-colors">
                        {agent.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {agent.category}
                      </p>
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-6">
                  <StatusBadge status={agent.status} />
                </td>
                <td className="py-4 px-6">
                  <VisibilityBadge visibility={agent.visibility} />
                </td>
                <td className="py-4 px-6">
                  <PricingBadge
                    isFree={agent.isFree}
                    price={agent.pricePerMonth}
                  />
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-300">
                  {agent.totalConversations}
                </td>
                <td className="py-4 px-6 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(agent.updatedAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/creator/agents/${agent.id}/edit`}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-brand-purple-600 transition-colors"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => onDelete(agent.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center"
    >
      <div className="text-6xl mb-4">{hasFilters ? "🔍" : "🤖"}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {hasFilters ? "No matching agents" : "No agents yet"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {hasFilters
          ? "Try adjusting your filters or search query."
          : "Create your first AI agent to get started."}
      </p>
      {!hasFilters && (
        <Link
          href="/creator/agents/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <span>+</span>
          Create Your First Agent
        </Link>
      )}
    </motion.div>
  );
}

// Delete Confirmation Modal
function DeleteModal({
  onConfirm,
  onCancel,
  isDeleting,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Delete Agent?
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This action cannot be undone. All data associated with this agent
            will be permanently deleted.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="px-6 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
