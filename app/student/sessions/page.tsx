"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCard, StaggerContainer } from "@/components/ui/animated-card";
import { SessionCard } from "@/components/sessions";
import {
  useMySessions,
  useUpcomingSessions,
  useCancelSession,
} from "@/hooks/useSessions";
import {
  Calendar,
  Clock,
  Video,
  Search,
  Filter,
  Plus,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { Session, SessionStatus } from "@/lib/types/session";

type TabType = "upcoming" | "all" | "completed";

export default function StudentSessionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SessionStatus | "all">(
    "all"
  );

  const { data: allSessions, isLoading: loadingAll } = useMySessions();
  const { data: upcomingSessions, isLoading: loadingUpcoming } =
    useUpcomingSessions();

  const isLoading = loadingAll || loadingUpcoming;

  // Filter and sort sessions based on active tab
  const getFilteredSessions = (): Session[] => {
    let sessions: Session[] = [];

    if (activeTab === "upcoming") {
      sessions = upcomingSessions || [];
    } else if (activeTab === "completed") {
      sessions = (allSessions || []).filter(
        (s) => s.status === "completed" || s.status === "cancelled"
      );
    } else {
      sessions = allSessions || [];
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.creatorName?.toLowerCase().includes(query) ||
          s.studentNotes?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      sessions = sessions.filter((s) => s.status === statusFilter);
    }

    return sessions;
  };

  const filteredSessions = getFilteredSessions();
  const upcomingCount = upcomingSessions?.length || 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          My Sessions
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <AnimatedCard className="p-4">
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

        <AnimatedCard className="p-4" delay={0.1}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 dark:bg-teal-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {allSessions?.filter((s) => s.status === "completed").length ||
                  0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </p>
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard className="p-4" delay={0.2}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Video className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {allSessions?.length || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Sessions
              </p>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {(["upcoming", "all", "completed"] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as SessionStatus | "all")
            }
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Book New Session */}
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Find Creator
        </Link>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredSessions.length > 0 ? (
        <StaggerContainer className="grid gap-4">
          {filteredSessions.map((session) => (
            <SessionCard key={session.id} session={session} variant="student" />
          ))}
        </StaggerContainer>
      ) : (
        <AnimatedCard className="p-8 text-center">
          <Video className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sessions found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {activeTab === "upcoming"
              ? "You don't have any upcoming sessions. Book one with a creator!"
              : "No sessions match your search criteria."}
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Find Creators
          </Link>
        </AnimatedCard>
      )}
    </div>
  );
}
