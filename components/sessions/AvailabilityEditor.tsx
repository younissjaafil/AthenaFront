"use client";

import { useState } from "react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Plus, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimeSlot, DayOfWeek } from "@/lib/types/session";
import { DAY_NAMES } from "@/lib/types/session";

interface AvailabilityEditorProps {
  slots: TimeSlot[];
  onChange: (slots: TimeSlot[]) => void;
  isLoading?: boolean;
}

const DEFAULT_TIME_OPTIONS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];

export function AvailabilityEditor({
  slots,
  onChange,
  isLoading = false,
}: AvailabilityEditorProps) {
  const [expandedDay, setExpandedDay] = useState<DayOfWeek | null>(null);

  const getSlotsForDay = (day: DayOfWeek) =>
    slots.filter((s) => s.dayOfWeek === day);

  const addSlot = (day: DayOfWeek) => {
    const daySlots = getSlotsForDay(day);
    const lastSlot = daySlots[daySlots.length - 1];

    // Default new slot: either after last slot or 9am-5pm
    const newSlot: TimeSlot = {
      dayOfWeek: day,
      startTime: lastSlot ? lastSlot.endTime : "09:00",
      endTime: lastSlot
        ? `${Math.min(parseInt(lastSlot.endTime.split(":")[0]) + 2, 20)
            .toString()
            .padStart(2, "0")}:00`
        : "17:00",
      isActive: true,
    };

    onChange([...slots, newSlot]);
  };

  const removeSlot = (day: DayOfWeek, index: number) => {
    const daySlots = getSlotsForDay(day);
    const slotToRemove = daySlots[index];

    onChange(
      slots.filter(
        (s) =>
          !(
            s.dayOfWeek === day &&
            s.startTime === slotToRemove.startTime &&
            s.endTime === slotToRemove.endTime
          )
      )
    );
  };

  const updateSlot = (
    day: DayOfWeek,
    index: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    const daySlots = getSlotsForDay(day);
    const targetSlot = daySlots[index];

    onChange(
      slots.map((s) => {
        if (
          s.dayOfWeek === day &&
          s.startTime === targetSlot.startTime &&
          s.endTime === targetSlot.endTime
        ) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const toggleDay = (day: DayOfWeek) => {
    const daySlots = getSlotsForDay(day);

    if (daySlots.length === 0) {
      // Add default slot
      addSlot(day);
    } else {
      // Remove all slots for this day
      onChange(slots.filter((s) => s.dayOfWeek !== day));
    }
  };

  return (
    <div className="space-y-2">
      {([0, 1, 2, 3, 4, 5, 6] as DayOfWeek[]).map((day) => {
        const daySlots = getSlotsForDay(day);
        const isActive = daySlots.length > 0;
        const isExpanded = expandedDay === day;

        return (
          <AnimatedCard
            key={day}
            className={cn(
              "p-4 transition-all",
              isActive
                ? "border-purple-200 dark:border-purple-800"
                : "opacity-60"
            )}
            hoverEffect={false}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleDay(day)}
                  disabled={isLoading}
                  className={cn(
                    "w-10 h-6 rounded-full relative transition-colors",
                    isActive ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                      isActive ? "translate-x-5" : "translate-x-1"
                    )}
                  />
                </button>
                <span
                  className={cn(
                    "font-medium",
                    isActive
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {DAY_NAMES[day]}
                </span>
              </div>

              {isActive && (
                <button
                  onClick={() => setExpandedDay(isExpanded ? null : day)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {isExpanded ? "Hide" : `${daySlots.length} slot(s)`}
                </button>
              )}
            </div>

            {/* Time Slots (Expanded) */}
            {isActive && isExpanded && (
              <div className="mt-4 space-y-3">
                {daySlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                  >
                    <Clock className="w-4 h-4 text-gray-400 shrink-0" />

                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(day, index, "startTime", e.target.value)
                      }
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      {DEFAULT_TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </option>
                      ))}
                    </select>

                    <span className="text-gray-400">to</span>

                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(day, index, "endTime", e.target.value)
                      }
                      disabled={isLoading}
                      className="flex-1 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                    >
                      {DEFAULT_TIME_OPTIONS.filter(
                        (t) => t > slot.startTime
                      ).map((time) => (
                        <option key={time} value={time}>
                          {new Date(`2000-01-01T${time}`).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => removeSlot(day, index)}
                      disabled={isLoading}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => addSlot(day)}
                  disabled={isLoading}
                  className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add time slot
                </button>
              </div>
            )}

            {/* Quick Preview (Collapsed) */}
            {isActive && !isExpanded && daySlots.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {daySlots.map((slot, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                  >
                    {new Date(
                      `2000-01-01T${slot.startTime}`
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    -{" "}
                    {new Date(`2000-01-01T${slot.endTime}`).toLocaleTimeString(
                      "en-US",
                      { hour: "numeric", minute: "2-digit", hour12: true }
                    )}
                  </span>
                ))}
              </div>
            )}
          </AnimatedCard>
        );
      })}
    </div>
  );
}
