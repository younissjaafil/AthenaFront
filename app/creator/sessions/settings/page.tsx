"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { AvailabilityEditor, DateOverrideEditor } from "@/components/sessions";
import {
  useMyAvailability,
  useSetAvailability,
  useMySessionSettings,
  useUpdateSessionSettings,
  useMyDateOverrides,
  useSetDateOverrides,
} from "@/hooks/useSessions";
import {
  ArrowLeft,
  Save,
  Loader2,
  Clock,
  DollarSign,
  Calendar,
  Settings,
  Check,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import type { TimeSlot, DateOverride } from "@/lib/types/session";

export default function SessionSettingsPage() {
  // Availability state
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [dateOverrides, setDateOverrides] = useState<DateOverride[]>([]);
  const [hasAvailabilityChanges, setHasAvailabilityChanges] = useState(false);

  // Settings state
  const [sessionDurations, setSessionDurations] = useState<number[]>([30, 60]);
  const [defaultDuration, setDefaultDuration] = useState(60);
  const [bufferTime, setBufferTime] = useState(15);
  const [minimumNoticeHours, setMinimumNoticeHours] = useState(24);
  const [maxAdvanceBookingDays, setMaxAdvanceBookingDays] = useState(30);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [pricePerDuration, setPricePerDuration] = useState<
    Record<string, number>
  >({});
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);

  // Queries
  const { data: availability, isLoading: loadingAvailability } =
    useMyAvailability();
  const { data: settings, isLoading: loadingSettings } = useMySessionSettings();
  const { data: savedOverrides } = useMyDateOverrides();

  // Mutations
  const setAvailability = useSetAvailability();
  const updateSettings = useUpdateSessionSettings();
  const setOverrides = useSetDateOverrides();

  // Initialize from fetched data
  useEffect(() => {
    if (availability) {
      setSlots(
        availability.map((a) => ({
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
          isActive: a.isActive,
        }))
      );
    }
  }, [availability]);

  useEffect(() => {
    if (settings) {
      setSessionDurations(settings.sessionDurations);
      setDefaultDuration(settings.defaultDuration);
      setBufferTime(settings.bufferTime);
      setMinimumNoticeHours(settings.minimumNoticeHours);
      setMaxAdvanceBookingDays(settings.maxAdvanceBookingDays);
      setAutoConfirm(settings.autoConfirm);
      setPricePerDuration(settings.pricePerDuration || {});
    }
  }, [settings]);

  // Load saved date overrides
  useEffect(() => {
    if (savedOverrides) {
      setDateOverrides(
        savedOverrides.map((o) => ({
          date: o.date,
          startTime: o.startTime || "09:00",
          endTime: o.endTime || "17:00",
          isAvailable: o.isAvailable,
        }))
      );
    }
  }, [savedOverrides]);

  const handleSlotsChange = (newSlots: TimeSlot[]) => {
    setSlots(newSlots);
    setHasAvailabilityChanges(true);
  };

  const handleSaveAvailability = async () => {
    try {
      // Save weekly availability
      await setAvailability.mutateAsync({ slots });

      // Save date overrides
      if (dateOverrides.length > 0) {
        await setOverrides.mutateAsync(dateOverrides);
      }

      setHasAvailabilityChanges(false);
    } catch (error) {
      console.error("Failed to save availability:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({
        sessionDurations,
        defaultDuration,
        bufferTime,
        minimumNoticeHours,
        maxAdvanceBookingDays,
        autoConfirm,
        pricePerDuration:
          Object.keys(pricePerDuration).length > 0
            ? pricePerDuration
            : undefined,
      });
      setHasSettingsChanges(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const toggleDuration = (duration: number) => {
    if (sessionDurations.includes(duration)) {
      if (sessionDurations.length > 1) {
        setSessionDurations(sessionDurations.filter((d) => d !== duration));
        setHasSettingsChanges(true);
      }
    } else {
      setSessionDurations(
        [...sessionDurations, duration].sort((a, b) => a - b)
      );
      setHasSettingsChanges(true);
    }
  };

  const updatePrice = (duration: number, price: number) => {
    setPricePerDuration((prev) => ({
      ...prev,
      [duration.toString()]: price,
    }));
    setHasSettingsChanges(true);
  };

  const isLoading = loadingAvailability || loadingSettings;

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
          Availability & Settings
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-600 dark:text-gray-400"
        >
          Configure your availability and session preferences
        </motion.p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Availability Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Weekly Availability
                </h2>
              </div>
              {hasAvailabilityChanges && (
                <button
                  onClick={handleSaveAvailability}
                  disabled={setAvailability.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {setAvailability.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Availability
                </button>
              )}
            </div>

            <AvailabilityEditor
              slots={slots}
              onChange={handleSlotsChange}
              isLoading={setAvailability.isPending}
            />

            {/* Date-Specific Overrides */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="w-5 h-5 text-purple-500" />
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  Special Dates
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add one-time availability or block specific dates (e.g.,
                &quot;Available Friday Dec 5th 3pm-6pm only&quot;)
              </p>
              <DateOverrideEditor
                overrides={dateOverrides}
                onChange={(newOverrides) => {
                  setDateOverrides(newOverrides);
                  setHasAvailabilityChanges(true);
                }}
                isLoading={setAvailability.isPending}
              />
            </div>
          </section>

          {/* Session Settings Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-teal-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Session Settings
                </h2>
              </div>
              {hasSettingsChanges && (
                <button
                  onClick={handleSaveSettings}
                  disabled={updateSettings.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  {updateSettings.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Settings
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* Session Durations */}
              <AnimatedCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Session Durations
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90, 120].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => toggleDuration(duration)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-1 ${
                        sessionDurations.includes(duration)
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                      }`}
                    >
                      {duration} min
                      {sessionDurations.includes(duration) && (
                        <Check className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </AnimatedCard>

              {/* Pricing */}
              <AnimatedCard className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Pricing per Duration
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sessionDurations.map((duration) => (
                    <div key={duration}>
                      <label className="text-sm text-gray-500 dark:text-gray-400">
                        {duration} minutes
                      </label>
                      <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          $
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="5"
                          value={pricePerDuration[duration.toString()] || ""}
                          onChange={(e) =>
                            updatePrice(
                              duration,
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          className="w-full pl-8 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Leave blank for free sessions
                </p>
              </AnimatedCard>

              {/* Other Settings */}
              <AnimatedCard className="p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                  Booking Rules
                </h3>

                <div className="space-y-4">
                  {/* Buffer Time */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Buffer between sessions
                    </label>
                    <select
                      value={bufferTime}
                      onChange={(e) => {
                        setBufferTime(parseInt(e.target.value));
                        setHasSettingsChanges(true);
                      }}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      <option value={0}>No buffer</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>

                  {/* Minimum Notice */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Minimum notice for booking
                    </label>
                    <select
                      value={minimumNoticeHours}
                      onChange={(e) => {
                        setMinimumNoticeHours(parseInt(e.target.value));
                        setHasSettingsChanges(true);
                      }}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={4}>4 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                    </select>
                  </div>

                  {/* Max Advance */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Maximum advance booking
                    </label>
                    <select
                      value={maxAdvanceBookingDays}
                      onChange={(e) => {
                        setMaxAdvanceBookingDays(parseInt(e.target.value));
                        setHasSettingsChanges(true);
                      }}
                      className="mt-1 w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      <option value={7}>1 week</option>
                      <option value={14}>2 weeks</option>
                      <option value={30}>1 month</option>
                      <option value={60}>2 months</option>
                      <option value={90}>3 months</option>
                    </select>
                  </div>

                  {/* Auto Confirm */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Auto-confirm bookings
                      </p>
                      <p className="text-xs text-gray-500">
                        Automatically confirm new session requests
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setAutoConfirm(!autoConfirm);
                        setHasSettingsChanges(true);
                      }}
                      className={`w-12 h-6 rounded-full relative transition-colors ${
                        autoConfirm
                          ? "bg-purple-600"
                          : "bg-gray-300 dark:bg-gray-700"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          autoConfirm ? "translate-x-7" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
