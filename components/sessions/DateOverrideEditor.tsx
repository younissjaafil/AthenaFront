"use client";

import { useState, useMemo } from "react";
import { Plus, X, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateOverride } from "@/lib/types/session";

interface DateOverrideEditorProps {
  overrides: DateOverride[];
  onChange: (overrides: DateOverride[]) => void;
  isLoading?: boolean;
}

// Generate 24-hour time options
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

export function DateOverrideEditor({
  overrides,
  onChange,
  isLoading = false,
}: DateOverrideEditorProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);

  // Get override dates as a map for quick lookup
  const overrideMap = useMemo(() => {
    const map = new Map<string, DateOverride[]>();
    overrides.forEach((o) => {
      const existing = map.get(o.date) || [];
      existing.push(o);
      map.set(o.date, existing);
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

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setShowAddForm(true);
  };

  const addOverride = () => {
    if (!selectedDate) return;

    const newOverride: DateOverride = {
      date: selectedDate,
      startTime: newStartTime,
      endTime: newEndTime,
      isAvailable,
    };

    onChange([...overrides, newOverride]);
    setShowAddForm(false);
    setNewStartTime("09:00");
    setNewEndTime("17:00");
    setIsAvailable(true);
  };

  const removeOverride = (date: string, index: number) => {
    const dateOverrides = overrideMap.get(date) || [];
    const toRemove = dateOverrides[index];
    onChange(
      overrides.filter(
        (o) =>
          !(
            o.date === date &&
            o.startTime === toRemove.startTime &&
            o.endTime === toRemove.endTime
          )
      )
    );
  };

  const formatTime = (time?: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-300">
          Date-Specific Availability
        </h4>
        <span className="text-xs text-gray-500">
          Click a date to add custom hours
        </span>
      </div>

      {/* Mini Calendar */}
      <div className="bg-slate-800/50 rounded-xl p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
              )
            }
            className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium text-white">{monthName}</span>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
              )
            }
            className="p-1.5 rounded-lg hover:bg-slate-700 text-gray-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-center text-xs font-medium text-gray-500 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            // Use local date format instead of UTC
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            const todayDate = new Date();
            const todayStr = `${todayDate.getFullYear()}-${String(
              todayDate.getMonth() + 1
            ).padStart(2, "0")}-${String(todayDate.getDate()).padStart(
              2,
              "0"
            )}`;
            const isToday = dateStr === todayStr;
            const isPast = dateStr < todayStr;
            const hasOverride = overrideMap.has(dateStr);
            const dateOverrides = overrideMap.get(dateStr) || [];
            const hasAvailable = dateOverrides.some((o) => o.isAvailable);
            const hasBlocked = dateOverrides.some((o) => !o.isAvailable);

            return (
              <button
                key={i}
                onClick={() => !isPast && handleDateClick(dateStr)}
                disabled={isPast || isLoading}
                className={cn(
                  "aspect-square rounded text-xs font-medium transition-all relative",
                  !isCurrentMonth && "text-gray-700",
                  isToday && "ring-1 ring-purple-500",
                  isPast && "opacity-40 cursor-not-allowed",
                  !isPast &&
                    isCurrentMonth &&
                    "hover:bg-slate-700 cursor-pointer",
                  hasAvailable && "bg-green-600/30 text-green-400",
                  hasBlocked && "bg-red-600/30 text-red-400",
                  hasAvailable &&
                    hasBlocked &&
                    "bg-yellow-600/30 text-yellow-400"
                )}
              >
                {date.getDate()}
                {hasOverride && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-current" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Override Form */}
      {showAddForm && selectedDate && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-purple-500/50">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-medium text-white">
              {formatDate(selectedDate)}
            </h5>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Available or Blocked */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsAvailable(true)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  isAvailable
                    ? "bg-green-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                )}
              >
                ✓ Available
              </button>
              <button
                onClick={() => setIsAvailable(false)}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                  !isAvailable
                    ? "bg-red-600 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                )}
              >
                ✗ Blocked
              </button>
            </div>

            {/* Time Selection */}
            {isAvailable && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Start Time
                  </label>
                  <select
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    End Time
                  </label>
                  <select
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {formatTime(time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={addOverride}
              disabled={isLoading}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Add {isAvailable ? "Availability" : "Block"}
            </button>
          </div>
        </div>
      )}

      {/* List of Overrides */}
      {overrides.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            Custom Dates
          </h5>
          {Array.from(overrideMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, dateOverrides]) => (
              <div
                key={date}
                className="bg-slate-800/50 rounded-lg p-3 space-y-2"
              >
                <div className="text-sm font-medium text-white">
                  {formatDate(date)}
                </div>
                {dateOverrides.map((override, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-lg text-sm",
                      override.isAvailable
                        ? "bg-green-600/20 text-green-400"
                        : "bg-red-600/20 text-red-400"
                    )}
                  >
                    <span>
                      {override.isAvailable && override.startTime && override.endTime
                        ? `${formatTime(override.startTime)} - ${formatTime(
                            override.endTime
                          )}`
                        : override.isAvailable
                        ? "Available all day"
                        : "Blocked all day"}
                    </span>
                    <button
                      onClick={() => removeOverride(date, index)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
