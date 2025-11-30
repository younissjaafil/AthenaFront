"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard, StaggerContainer } from "@/components/ui/animated-card";
import { SessionCard } from "@/components/sessions";
import {
  useCreatorSessions,
  useConfirmSession,
  useCancelSession,
} from "@/hooks/useSessions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Calendar,
  Clock,
  Video,
  Settings,
  Loader2,
  Users,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import type { Session, SessionStatus } from "@/lib/types/session";

type TabType = "upcoming" | "pending" | "all" | "completed";

export default function CreatorSessionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const { data: user, isLoading: loadingUser } = useCurrentUser();

  const { data: sessions, isLoading: loadingSessions } = useCreatorSessions(
    user?.creatorId || ""
  );

  const isLoading = loadingUser || loadingSessions;

  // Filter sessions based on active tab
  const getFilteredSessions = (): Session[] => {
    if (!sessions) return [];

    switch (activeTab) {
      case "pending":
        return sessions.filter((s) => s.status === "pending");
      case "upcoming":
        return sessions.filter(
          (s) =>
            (s.status === "confirmed" || s.status === "in_progress") &&
            new Date(s.scheduledAt) > new Date()
        );
      case "completed":
        return sessions.filter(
          (s) => s.status === "completed" || s.status === "cancelled"
        );
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();
  const pendingCount =
    sessions?.filter((s) => s.status === "pending").length || 0;
  const upcomingCount =
    sessions?.filter(
      (s) => s.status === "confirmed" && new Date(s.scheduledAt) > new Date()
    ).length || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
          >
            Sessions Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 dark:text-gray-400"
          >
            Manage your live coaching sessions
          </motion.p>
        </div>

        <Link
          href="/creator/sessions/settings"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Manage Availability
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AnimatedCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pending Approval
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {upcomingCount}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upcoming
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4" delay={0.2}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Users className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sessions?.filter((s) => s.status === "completed").length || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4" delay={0.3}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {sessions?.length || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sessions
              </p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg w-fit mb-6">
        {(["pending", "upcoming", "completed", "all"] as TabType[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors relative ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "pending" && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
          )
        )}
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredSessions.length > 0 ? (
        <StaggerContainer className="grid gap-4">
          {filteredSessions.map((session) => (
            <CreatorSessionCard key={session.id} session={session} />
          ))}
        </StaggerContainer>
      ) : (
        <AnimatedCard className="p-8 text-center">
          <Video className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sessions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === "pending"
              ? "No pending session requests to review."
              : activeTab === "upcoming"
              ? "No upcoming sessions scheduled."
              : "No sessions match this filter."}
          </p>
        </AnimatedCard>
      )}
    </div>
  );
}

// Creator Session Card with actions
function CreatorSessionCard({ session }: { session: Session }) {
  const confirmSession = useConfirmSession(session.id);
  const cancelSession = useCancelSession(session.id);

  const handleConfirm = async () => {
    try {
      await confirmSession.mutateAsync();
    } catch (error) {
      console.error("Failed to confirm session:", error);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancellation (optional):");
    try {
      await cancelSession.mutateAsync(reason || undefined);
    } catch (error) {
      console.error("Failed to cancel session:", error);
    }
  };

  return (
    <SessionCard
      session={session}
      variant="creator"
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
