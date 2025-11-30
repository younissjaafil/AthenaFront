"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, CalendarDays } from "lucide-react";
import Link from "next/link";
import { AvailabilityManager, DateOverrideEditor } from "@/components/sessions";
import { AnimatedCard } from "@/components/ui/animated-card";
import { useState } from "react";

type Tab = "weekly" | "overrides";

export default function CreatorAvailabilityPage() {
  const [activeTab, setActiveTab] = useState<Tab>("weekly");

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/creator/sessions"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Manage Availability
        </motion.h1>
        <p className="text-gray-500 dark:text-gray-400">
          Set your weekly schedule and add date-specific overrides
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("weekly")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "weekly"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Weekly Schedule
        </button>
        <button
          onClick={() => setActiveTab("overrides")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "overrides"
              ? "bg-purple-600 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          Date Overrides
        </button>
      </div>

      {/* Content */}
      {activeTab === "weekly" ? (
        <AvailabilityManager />
      ) : (
        <div className="space-y-6">
          <AnimatedCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CalendarDays className="w-5 h-5 text-purple-500" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Date Overrides
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add special availability for specific dates or block days off
                </p>
              </div>
            </div>
            <DateOverrideEditor />
          </AnimatedCard>
        </div>
      )}

      {/* Help Card */}
      <AnimatedCard className="p-4 mt-8 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800" delay={0.2}>
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-blue-500 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              How availability works
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1">
              <li>• <strong>Weekly Schedule:</strong> Set your regular recurring availability (e.g., every Monday 9 AM - 5 PM)</li>
              <li>• <strong>Date Overrides:</strong> Add one-time availability for specific dates or block days when you&apos;re unavailable</li>
              <li>• Date overrides take priority over your weekly schedule</li>
            </ul>
          </div>
        </div>
      </AnimatedCard>
    </div>
  );
}
