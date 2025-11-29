"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useMyAgents } from "@/hooks/useAgents";
import {
  StatsCard,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-card";
import {
  IsPublicBadge,
  StatusBadge,
  PricingBadge,
} from "@/components/ui/badge";
import type { Agent } from "@/lib/types/agent";

export default function CreatorDashboard() {
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { data: agents, isLoading: isAgentsLoading } = useMyAgents();

  const firstName = user?.firstName || "Creator";
  const totalAgents = agents?.length || 0;
  const activeAgents = agents?.filter((a) => a.status === "active").length || 0;
  const totalConversations =
    agents?.reduce((sum, a) => sum + (a.totalConversations || 0), 0) || 0;

  // Show loading skeleton
  if (isUserLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here&apos;s what&apos;s happening with your agents today.
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Agents"
          value={totalAgents}
          change={totalAgents > 0 ? `${activeAgents} active` : undefined}
          icon="🤖"
          delay={0}
        />
        <StatsCard
          title="Total Sessions"
          value={totalConversations.toLocaleString()}
          change="All time"
          icon="💬"
          delay={0.1}
          colorClass="text-brand-teal-500 dark:text-brand-teal-400"
        />
        <StatsCard
          title="Active Users"
          value="—"
          change="Coming soon"
          icon="👥"
          delay={0.2}
          colorClass="text-gray-400"
        />
        <StatsCard
          title="Revenue"
          value="$0"
          change="Coming soon"
          icon="💰"
          delay={0.3}
          colorClass="text-gray-400"
        />
      </div>

      {/* My Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Agents
          </h2>
          <Link
            href="/creator/agents"
            className="text-sm text-brand-purple-600 dark:text-brand-purple-400 hover:underline"
          >
            View all →
          </Link>
        </div>

        {isAgentsLoading && <AgentsGridSkeleton />}

        {!isAgentsLoading && (!agents || agents.length === 0) && (
          <EmptyAgents />
        )}

        {!isAgentsLoading && agents && agents.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.slice(0, 6).map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            href="/creator/agents/new"
            icon="🤖"
            title="Create Agent"
            description="Build a new AI assistant"
            delay={0}
          />
          <QuickActionCard
            href="/creator/documents"
            icon="📄"
            title="Upload Documents"
            description="Add knowledge to your agents"
            delay={0.1}
          />
          <QuickActionCard
            href="/creator/analytics"
            icon="📈"
            title="View Analytics"
            description="Track performance metrics"
            delay={0.2}
          />
          <QuickActionCard
            href="/creator/settings"
            icon="⚙️"
            title="Settings"
            description="Manage your profile"
            delay={0.3}
          />
        </div>
      </div>
    </div>
  );
}

// Agent Card Component
function AgentCard({ agent }: { agent: Agent }) {
  return (
    <StaggerItem className="group cursor-pointer">
      <Link href={`/creator/agents/${agent.id}/edit`} className="block">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-purple-500 to-brand-teal-500 flex items-center justify-center text-white text-lg font-semibold">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-purple-600 dark:group-hover:text-brand-purple-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {agent.category}
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {agent.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <IsPublicBadge isPublic={agent.isPublic} />
          <StatusBadge status={agent.status} />
          <PricingBadge
            isFree={agent.isFree}
            price={agent.pricePerConversation}
          />
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{agent.totalConversations} conversations</span>
          <span>Updated {new Date(agent.updatedAt).toLocaleDateString()}</span>
        </div>
      </Link>
    </StaggerItem>
  );
}

// Quick Action Card
function QuickActionCard({
  href,
  icon,
  title,
  description,
  delay,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Link
        href={href}
        className="block p-4 rounded-xl border border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-brand-purple-300 dark:hover:border-brand-purple-700 hover:shadow-md transition-all group"
      >
        <span className="text-2xl mb-2 block">{icon}</span>
        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-purple-600 dark:group-hover:text-brand-purple-400 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </Link>
    </motion.div>
  );
}

// Empty State
function EmptyAgents() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center"
    >
      <div className="text-6xl mb-4">🤖</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No agents yet
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        Create your first AI agent to start building your audience and earning
        revenue.
      </p>
      <Link
        href="/creator/agents/new"
        className="btn-primary inline-flex items-center gap-2"
      >
        <span>+</span>
        Create Your First Agent
      </Link>
    </motion.div>
  );
}

// Loading Skeletons
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-72 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    </div>
  );
}

function AgentsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-48 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}
