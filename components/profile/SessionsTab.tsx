"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  DollarSign,
  Video,
  Globe,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SessionSettings } from "@/hooks/useCreators";
import { useCreatorAvailability } from "@/hooks/useSessions";
import { DAY_NAMES, type DayOfWeek } from "@/lib/types/session";

interface SessionsTabProps {
  sessionSettings: SessionSettings | null | undefined;
  isLoading: boolean;
  creatorId: string;
  creatorName?: string;
}

export function SessionsTab({
  sessionSettings,
  isLoading,
  creatorId,
  creatorName,
}: SessionsTabProps) {
  const { data: availability, isLoading: availabilityLoading } =
    useCreatorAvailability(creatorId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
        <div className="animate-pulse h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (!sessionSettings) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Sessions Not Available
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This creator hasn&apos;t set up their session availability yet.
        </p>
      </div>
    );
  }

  // Calculate pricing display
  const pricePerDuration = sessionSettings.pricePerDuration || {};
  const durations = sessionSettings.sessionDurations || [30, 60];
  const defaultDuration = sessionSettings.defaultDuration || 60;

  // Get prices for display
  const pricingOptions = durations.map((duration) => ({
    duration,
    price: pricePerDuration[duration.toString()] || 0,
    isDefault: duration === defaultDuration,
  }));

  const hasFreeOption =
    sessionSettings.allowFreeSession ||
    pricingOptions.some((opt) => opt.price === 0);

  // Group availability by day
  const availabilityByDay = availability?.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<DayOfWeek, typeof availability>);

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Session Availability Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-6"
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Book a 1:1 Session
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Get personalized guidance from {creatorName || "this creator"}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              Available
            </span>
          </div>
        </div>

        {/* Pricing Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {pricingOptions.map((option, index) => (
            <div
              key={option.duration}
              className={`relative p-4 rounded-lg border ${
                option.isDefault
                  ? "bg-white dark:bg-gray-800 border-purple-300 dark:border-purple-700 shadow-sm"
                  : "bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
              }`}
            >
              {option.isDefault && (
                <div className="absolute -top-2 left-4">
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-600 text-white rounded-full">
                    Popular
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {option.duration} minutes
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                {option.price === 0 ? (
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    Free
                  </span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${option.price}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      USD
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Book Session CTA */}
        <Link href={`/student/sessions/book/${creatorId}`}>
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
            <Calendar className="w-5 h-5" />
            Book a Session
          </button>
        </Link>
      </motion.div>

      {/* Weekly Availability Schedule */}
      {availability && availability.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Weekly Availability
            </h4>
          </div>
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => {
              const daySlots = availabilityByDay?.[day as DayOfWeek] || [];
              const hasSlots = daySlots.length > 0;

              return (
                <div
                  key={day}
                  className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div className="min-w-[100px]">
                    <p
                      className={`font-medium ${
                        hasSlots
                          ? "text-green-600 dark:text-green-400"
                          : "text-gray-400 dark:text-gray-600"
                      }`}
                    >
                      {DAY_NAMES[day as DayOfWeek]}
                    </p>
                  </div>
                  <div className="flex-1">
                    {hasSlots ? (
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium rounded-full border border-green-300 dark:border-green-700"
                          >
                            <Clock className="w-3 h-3" />
                            {formatTime(slot.startTime)} -{" "}
                            {formatTime(slot.endTime)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 dark:text-gray-600">
                        Not available
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Timezone: {sessionSettings.timezone || "UTC"}
            </p>
          </div>
        </motion.div>
      )}

      {/* Session Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6"
      >
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Session Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem
            icon={<Video className="w-4 h-4" />}
            label="Format"
            value="Video Call"
          />
          <DetailItem
            icon={<Globe className="w-4 h-4" />}
            label="Timezone"
            value={sessionSettings.timezone || "UTC"}
          />
          <DetailItem
            icon={<Clock className="w-4 h-4" />}
            label="Buffer Time"
            value={`${
              sessionSettings.bufferTime || 15
            } minutes between sessions`}
          />
          <DetailItem
            icon={<AlertCircle className="w-4 h-4" />}
            label="Minimum Notice"
            value={`${
              sessionSettings.minimumNoticeHours || 24
            } hours advance booking`}
          />
          <DetailItem
            icon={<Calendar className="w-4 h-4" />}
            label="Book In Advance"
            value={`Up to ${sessionSettings.maxAdvanceBookingDays || 30} days`}
          />
          <DetailItem
            icon={
              sessionSettings.autoConfirm ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Clock className="w-4 h-4" />
              )
            }
            label="Confirmation"
            value={sessionSettings.autoConfirm ? "Instant" : "Manual approval"}
          />
        </div>

        {/* Cancellation Policy */}
        {sessionSettings.cancellationPolicy && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cancellation Policy
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {sessionSettings.cancellationPolicy}
            </p>
          </div>
        )}

        {/* Welcome Message */}
        {sessionSettings.welcomeMessage && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Welcome Message
            </h5>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              &quot;{sessionSettings.welcomeMessage}&quot;
            </p>
          </div>
        )}
      </motion.div>

      {/* Free vs Paid Info */}
      {hasFreeOption && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h5 className="font-medium text-green-800 dark:text-green-300 mb-1">
                Free Session Available
              </h5>
              <p className="text-sm text-green-700 dark:text-green-400">
                This creator offers free introductory sessions. Book now to get
                started!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetailItem({ icon, label, value }: DetailItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="font-medium text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}
