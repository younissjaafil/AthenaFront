"use client";

import { useState, useEffect } from "react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Loader2,
  ChevronDown,
  ChevronUp 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useMyAvailability, 
  useSetAvailability 
} from "@/hooks/useSessions";
import type { AvailabilitySlot } from "@/lib/types/session";

const DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

// Generate time options in 30-minute intervals (24 hours)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const time = `${hours.toString().padStart(2, "0")}:${minutes}`;
  const display = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { value: time, label: display };
});

interface DayAvailability {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export function AvailabilityManager() {
  const { data: existingAvailability, isLoading } = useMyAvailability();
  const setAvailability = useSetAvailability();
  
  const [useStandardHours, setUseStandardHours] = useState(true);
  const [standardStart, setStandardStart] = useState("09:00");
  const [standardEnd, setStandardEnd] = useState("17:00");
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  
  const [days, setDays] = useState<DayAvailability[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      enabled: false,
      startTime: "09:00",
      endTime: "17:00",
    }))
  );

  // Load existing availability
  useEffect(() => {
    if (existingAvailability && existingAvailability.length > 0) {
      const newDays = DAYS.map((d) => {
        const existing = existingAvailability.find(
          (a) => a.dayOfWeek === d.value
        );
        return {
          dayOfWeek: d.value,
          enabled: !!existing,
          startTime: existing?.startTime || "09:00",
          endTime: existing?.endTime || "17:00",
        };
      });
      setDays(newDays);
      
      // Check if all enabled days have the same hours
      const enabledDays = newDays.filter((d) => d.enabled);
      if (enabledDays.length > 0) {
        const firstStart = enabledDays[0].startTime;
        const firstEnd = enabledDays[0].endTime;
        const allSame = enabledDays.every(
          (d) => d.startTime === firstStart && d.endTime === firstEnd
        );
        setUseStandardHours(allSame);
        if (allSame) {
          setStandardStart(firstStart);
          setStandardEnd(firstEnd);
        }
      }
    }
  }, [existingAvailability]);

  const toggleDay = (dayOfWeek: number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek
          ? { 
              ...d, 
              enabled: !d.enabled,
              startTime: useStandardHours ? standardStart : d.startTime,
              endTime: useStandardHours ? standardEnd : d.endTime,
            }
          : d
      )
    );
  };

  const updateDayTime = (
    dayOfWeek: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setDays((prev) =>
      prev.map((d) =>
        d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d
      )
    );
  };

  const toggleExpanded = (dayOfWeek: number) => {
    setExpandedDays((prev) =>
      prev.includes(dayOfWeek)
        ? prev.filter((d) => d !== dayOfWeek)
        : [...prev, dayOfWeek]
    );
  };

  const handleSave = async () => {
    const slots: AvailabilitySlot[] = days
      .filter((d) => d.enabled)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6,
        startTime: useStandardHours ? standardStart : d.startTime,
        endTime: useStandardHours ? standardEnd : d.endTime,
      }));

    await setAvailability.mutateAsync({ slots });
  };

  const enabledCount = days.filter((d) => d.enabled).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Weekly Availability
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Select the days and times you're available for sessions
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={setAvailability.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {setAvailability.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </button>
      </div>

      {/* Standard Hours Toggle */}
      <AnimatedCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Use Standard Hours
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Apply the same hours to all selected days
              </p>
            </div>
          </div>
          <button
            onClick={() => setUseStandardHours(!useStandardHours)}
            className={cn(
              "relative w-12 h-6 rounded-full transition-colors",
              useStandardHours ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"
            )}
          >
            <span
              className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-transform",
                useStandardHours ? "translate-x-7" : "translate-x-1"
              )}
            />
          </button>
        </div>

        {useStandardHours && (
          <div className="mt-4 flex items-center gap-4 pl-8">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                From
              </label>
              <select
                value={standardStart}
                onChange={(e) => setStandardStart(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                To
              </label>
              <select
                value={standardEnd}
                onChange={(e) => setStandardEnd(e.target.value)}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </AnimatedCard>

      {/* Days Grid */}
      <AnimatedCard className="p-4" delay={0.1}>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-teal-500" />
          <p className="font-medium text-gray-900 dark:text-white">
            Select Available Days
          </p>
          <span className="ml-auto text-sm text-gray-500">
            {enabledCount} day{enabledCount !== 1 ? "s" : ""} selected
          </span>
        </div>

        <div className="space-y-2">
          {DAYS.map((day) => {
            const dayData = days.find((d) => d.dayOfWeek === day.value)!;
            const isExpanded = expandedDays.includes(day.value);

            return (
              <div
                key={day.value}
                className={cn(
                  "border rounded-lg transition-colors",
                  dayData.enabled
                    ? "border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-900/10"
                    : "border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="flex items-center p-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors mr-3",
                      dayData.enabled
                        ? "bg-purple-600 border-purple-600"
                        : "border-gray-300 dark:border-gray-600"
                    )}
                  >
                    {dayData.enabled && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Day Name */}
                  <span
                    className={cn(
                      "font-medium flex-1",
                      dayData.enabled
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-500 dark:text-gray-400"
                    )}
                  >
                    {day.label}
                  </span>

                  {/* Time Display / Custom Hours Toggle */}
                  {dayData.enabled && (
                    <>
                      {useStandardHours ? (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {TIME_OPTIONS.find((t) => t.value === standardStart)?.label} -{" "}
                          {TIME_OPTIONS.find((t) => t.value === standardEnd)?.label}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleExpanded(day.value)}
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                        >
                          {TIME_OPTIONS.find((t) => t.value === dayData.startTime)?.label} -{" "}
                          {TIME_OPTIONS.find((t) => t.value === dayData.endTime)?.label}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>

                {/* Expanded Custom Hours */}
                {dayData.enabled && !useStandardHours && isExpanded && (
                  <div className="px-3 pb-3 flex items-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-3 ml-8">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-300">
                        From
                      </label>
                      <select
                        value={dayData.startTime}
                        onChange={(e) =>
                          updateDayTime(day.value, "startTime", e.target.value)
                        }
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-300">
                        To
                      </label>
                      <select
                        value={dayData.endTime}
                        onChange={(e) =>
                          updateDayTime(day.value, "endTime", e.target.value)
                        }
                        className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                      >
                        {TIME_OPTIONS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AnimatedCard>

      {/* Success Message */}
      {setAvailability.isSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
          ✓ Availability saved successfully!
        </div>
      )}
    </div>
  );
}
