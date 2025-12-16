"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  useAgent,
  useAgentAnalytics,
  useAgentLogs,
  useSubmitFeedback,
  type RagQueryLog,
} from "@/hooks/useAgents";

export default function AgentAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const [days, setDays] = useState(30);
  const [outcomeFilter, setOutcomeFilter] = useState<
    "all" | "answered" | "idk"
  >("all");
  const [feedbackFilter, setFeedbackFilter] = useState<
    "all" | "up" | "down"
  >("all");

  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const {
    data: analytics,
    isLoading: analyticsLoading,
    refetch: refetchAnalytics,
  } = useAgentAnalytics(agentId, days);
  const {
    data: logs,
    isLoading: logsLoading,
    refetch: refetchLogs,
  } = useAgentLogs(agentId, {
    limit: 100,
    outcome: outcomeFilter === "all" ? undefined : outcomeFilter,
    feedback: feedbackFilter === "all" ? undefined : feedbackFilter,
  });

  const submitFeedback = useSubmitFeedback();

  const handleFeedback = async (
    logId: string,
    feedback: "up" | "down"
  ) => {
    await submitFeedback.mutateAsync({ logId, feedback });
    refetchLogs();
    refetchAnalytics();
  };

  if (agentLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Agent not found
        </p>
        <Link
          href="/creator/agents"
          className="text-purple-600 hover:underline"
        >
          Back to agents
        </Link>
      </div>
    );
  }

  const answerRate = analytics
    ? ((analytics.answeredCount / Math.max(analytics.totalQueries, 1)) * 100).toFixed(1)
    : "0";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {agent.name} Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            RAG performance and query insights
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            onClick={() => {
              refetchAnalytics();
              refetchLogs();
            }}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Queries"
          value={analytics?.totalQueries || 0}
          icon={<MessageSquare className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          title="Answer Rate"
          value={`${answerRate}%`}
          subtitle={`${analytics?.answeredCount || 0} answered`}
          icon={<CheckCircle className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="IDK Rate"
          value={`${((analytics?.idkRate || 0) * 100).toFixed(1)}%`}
          subtitle={`${analytics?.idkCount || 0} uncertain`}
          icon={<HelpCircle className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          title="Avg Latency"
          value={`${Math.round(analytics?.avgLatencyMs || 0)}ms`}
          subtitle={`${Math.round(analytics?.avgRetrievalMs || 0)}ms retrieval`}
          icon={<Clock className="w-5 h-5" />}
          color="blue"
        />
      </div>

      {/* Feedback Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Positive Feedback"
          value={analytics?.feedbackUpCount || 0}
          icon={<ThumbsUp className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Negative Feedback"
          value={analytics?.feedbackDownCount || 0}
          icon={<ThumbsDown className="w-5 h-5" />}
          color="red"
        />
        <StatCard
          title="Satisfaction Rate"
          value={`${((analytics?.feedbackRate || 0) * 100).toFixed(0)}%`}
          subtitle="of rated responses"
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
      </div>

      {/* Query Volume Chart */}
      {analytics?.queriesOverTime && analytics.queriesOverTime.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Query Volume Over Time
          </h2>
          <div className="h-48 flex items-end gap-1">
            {analytics.queriesOverTime.map((day, i) => {
              const maxCount = Math.max(
                ...analytics.queriesOverTime.map((d) => d.count)
              );
              const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full bg-purple-500 rounded-t transition-all hover:bg-purple-600"
                    style={{ height: `${height}%`, minHeight: day.count > 0 ? "4px" : 0 }}
                    title={`${day.date}: ${day.count} queries`}
                  />
                  {i % 7 === 0 && (
                    <span className="text-xs text-gray-500 rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top IDK Reasons */}
      {analytics?.topIdkReasons && analytics.topIdkReasons.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Top IDK Reasons
          </h2>
          <div className="space-y-2">
            {analytics.topIdkReasons.map((reason) => (
              <div
                key={reason.reason}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <span className="font-medium capitalize">
                  {reason.reason.replace(/_/g, " ")}
                </span>
                <span className="text-gray-500">{reason.count} occurrences</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query Logs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Query Logs
          </h2>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={outcomeFilter}
              onChange={(e) =>
                setOutcomeFilter(e.target.value as "all" | "answered" | "idk")
              }
              className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All outcomes</option>
              <option value="answered">Answered</option>
              <option value="idk">IDK</option>
            </select>
            <select
              value={feedbackFilter}
              onChange={(e) =>
                setFeedbackFilter(e.target.value as "all" | "up" | "down")
              }
              className="px-2 py-1 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-700"
            >
              <option value="all">All feedback</option>
              <option value="up">Positive</option>
              <option value="down">Negative</option>
            </select>
          </div>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : logs && logs.length > 0 ? (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {logs.map((log) => (
              <QueryLogCard
                key={log.id}
                log={log}
                onFeedback={handleFeedback}
                isSubmitting={submitFeedback.isPending}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No query logs found for the selected filters
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: "purple" | "green" | "amber" | "blue" | "red";
}) {
  const colorClasses = {
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Query Log Card Component
function QueryLogCard({
  log,
  onFeedback,
  isSubmitting,
}: {
  log: RagQueryLog;
  onFeedback: (logId: string, feedback: "up" | "down") => void;
  isSubmitting: boolean;
}) {
  const isAnswered = log.outcome === "answered";

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 dark:text-white font-medium truncate">
            {log.query}
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isAnswered
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {isAnswered ? "Answered" : "IDK"}
            </span>
            {log.idkReason && (
              <span className="text-xs text-gray-400">
                ({log.idkReason.replace(/_/g, " ")})
              </span>
            )}
            <span>{log.retrievedCount} chunks</span>
            <span>
              {log.maxSimilarity
                ? `${(log.maxSimilarity * 100).toFixed(0)}% similarity`
                : "No matches"}
            </span>
            <span>{log.latencyMs}ms</span>
            <span className="text-gray-400">
              {new Date(log.createdAt).toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onFeedback(log.id, "up")}
            disabled={isSubmitting || log.feedback === "up"}
            className={`p-2 rounded-lg transition-colors ${
              log.feedback === "up"
                ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-green-600"
            }`}
            title="Good response"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onFeedback(log.id, "down")}
            disabled={isSubmitting || log.feedback === "down"}
            className={`p-2 rounded-lg transition-colors ${
              log.feedback === "down"
                ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-600"
            }`}
            title="Poor response"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
