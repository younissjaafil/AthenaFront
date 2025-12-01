"use client";

import { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateOverride } from "@/lib/types/session";

interface AvailabilityCalendarProps {
  overrides: DateOverride[];
  onChange: (overrides: DateOverride[]) => void;
  isLoading?: boolean;
}

// Generate time options (30 min intervals)
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateDisplay = (dateStr: string) => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

export function AvailabilityCalendar({
  overrides,
  onChange,
  isLoading = false,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Map overrides by date for quick lookup
  const overrideMap = useMemo(() => {
    const map = new Map<string, DateOverride>();
    overrides.forEach((o) => {
      map.set(o.date, o);
    });
    return map;
  }, [overrides]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding (complete to 6 rows)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const todayStr = formatDateKey(new Date());

  const toggleDate = (dateStr: string) => {
    if (overrideMap.has(dateStr)) {
      // Remove the date
      onChange(overrides.filter((o) => o.date !== dateStr));
    } else {
      // Add the date with default times
      onChange([
        ...overrides,
        {
          date: dateStr,
          startTime: "09:00",
          endTime: "17:00",
          isAvailable: true,
        },
      ]);
    }
  };

  const updateTime = (
    dateStr: string,
    field: "startTime" | "endTime",
    value: string
  ) => {
    onChange(
      overrides.map((o) => (o.date === dateStr ? { ...o, [field]: value } : o))
    );
  };

  const removeDate = (dateStr: string) => {
    onChange(overrides.filter((o) => o.date !== dateStr));
  };

  // Sort selected dates
  const selectedDates = [...overrides]
    .filter((o) => o.isAvailable)
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-base font-semibold text-white">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-2 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dateStr = formatDateKey(date);
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const isSelected = overrideMap.has(dateStr);

            return (
              <button
                key={i}
                onClick={() => !isPast && toggleDate(dateStr)}
                disabled={isPast || isLoading}
                className={cn(
                  "aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center",
                  !isCurrentMonth && "text-gray-700",
                  isCurrentMonth && !isPast && "text-gray-300",
                  isToday && !isSelected && "ring-2 ring-purple-500",
                  isPast && "opacity-40 cursor-not-allowed",
                  !isPast && !isSelected && "hover:bg-slate-700 cursor-pointer",
                  isSelected &&
                    "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer"
                )}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Click dates to select/deselect when you&apos;re available
        </p>
      </div>

      {/* Selected Dates with Time Inputs */}
      {selectedDates.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Selected Dates ({selectedDates.length})
            </h4>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {selectedDates.map((override) => (
              <div
                key={override.date}
                className="bg-slate-800/50 rounded-lg p-3 flex items-center gap-3"
              >
                {/* Date label */}
                <div className="min-w-[100px] text-sm font-medium text-white">
                  {formatDateDisplay(override.date)}
                </div>

                {/* Time selectors */}
                <div className="flex items-center gap-2 flex-1">
                  <select
                    value={override.startTime}
                    onChange={(e) =>
                      updateTime(override.date, "startTime", e.target.value)
                    }
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white flex-1"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>

                  <span className="text-gray-500">to</span>

                  <select
                    value={override.endTime}
                    onChange={(e) =>
                      updateTime(override.date, "endTime", e.target.value)
                    }
                    className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-sm text-white flex-1"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeDate(override.date)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {selectedDates.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No dates selected yet</p>
          <p className="text-xs mt-1">
            Click on calendar dates to add your availability
          </p>
        </div>
      )}
    </div>
  );
}
