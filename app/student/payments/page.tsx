"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useTransactions, useEntitlements } from "@/hooks/usePayments";
import { TransactionStatus } from "@/lib/types/payment";
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  Bot,
  Calendar,
  Receipt,
  Filter,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from "lucide-react";

const statusConfig: Record<
  TransactionStatus,
  { label: string; color: string; icon: typeof CheckCircle2 }
> = {
  [TransactionStatus.SUCCESS]: {
    label: "Completed",
    color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
    icon: CheckCircle2,
  },
  [TransactionStatus.PENDING]: {
    label: "Pending",
    color: "text-amber-500 bg-amber-50 dark:bg-amber-500/10",
    icon: Clock,
  },
  [TransactionStatus.FAILED]: {
    label: "Failed",
    color: "text-red-500 bg-red-50 dark:bg-red-500/10",
    icon: XCircle,
  },
  [TransactionStatus.REFUNDED]: {
    label: "Refunded",
    color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10",
    icon: RotateCcw,
  },
};

// Helper to safely get status config
const getStatusConfig = (status: TransactionStatus | string) => {
  return (
    statusConfig[status as TransactionStatus] || {
      label: status || "Unknown",
      color: "text-gray-500 bg-gray-100 dark:bg-gray-700",
      icon: Clock,
    }
  );
};

export default function PaymentHistoryPage() {
  const { data: transactions, isLoading: loadingTransactions } =
    useTransactions();
  const { data: entitlements, isLoading: loadingEntitlements } =
    useEntitlements();
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | "all">(
    "all"
  );
  const [showFilters, setShowFilters] = useState(false);

  const isLoading = loadingTransactions || loadingEntitlements;

  const filteredTransactions = transactions?.filter((t) =>
    statusFilter === "all" ? true : t.status === statusFilter
  );

  const totalSpent =
    transactions
      ?.filter((t) => t.status === TransactionStatus.SUCCESS)
      .reduce((sum, t) => sum + Number(t.amount || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          View your transactions and active subscriptions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Spent
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${totalSpent.toFixed(2)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Agents
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {entitlements?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transactions
              </p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {transactions?.length || 0}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Active Entitlements */}
      {entitlements && entitlements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Unlocked Agents
          </h2>
          <div className="space-y-3">
            {entitlements.map((entitlement) => (
              <div
                key={entitlement.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {entitlement.agentName ||
                        entitlement.agent?.name ||
                        "Agent"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Unlocked{" "}
                      {new Date(entitlement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/explore/agents/${entitlement.agentId}`}
                  className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-500/20 transition-colors"
                >
                  Chat Now
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Transactions Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Transactions
          </h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-purple-600 text-white"
                    : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                All
              </button>
              {Object.entries(statusConfig).map(([status, config]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as TransactionStatus)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {config.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {filteredTransactions && filteredTransactions.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => {
              const config = getStatusConfig(transaction.status);
              const StatusIcon = config.icon;

              return (
                <div
                  key={transaction.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-lg ${config.color} flex items-center justify-center`}
                      >
                        <StatusIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.invoice || "Payment"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(
                              transaction.createdAt
                            ).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>#{transaction.externalId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        ${Number(transaction.amount || 0).toFixed(2)}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          {transaction.currency || "USD"}
                        </span>
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${config.color}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your payment history will appear here
            </p>
            <Link
              href="/explore/agents"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
            >
              Explore Agents
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
