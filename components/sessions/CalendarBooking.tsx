"use client";

import { useState, useMemo } from "react";
import { AnimatedCard } from "@/components/ui/animated-card";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AvailableSlotsForDate } from "@/lib/types/session";

interface CalendarBookingProps {
  availableSlots: AvailableSlotsForDate[];
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectSlot: (date: string, time: string) => void;
  isLoading?: boolean;
}

export function CalendarBooking({
  availableSlots,
  selectedDate,
  selectedTime,
  onSelectSlot,
  isLoading = false,
}: CalendarBookingProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  // Create a map of available dates and their slots
  const availabilityMap = useMemo(() => {
    const map = new Map<string, string[]>();
    availableSlots.forEach((day) => {
      map.set(day.date, day.slots);
    });
    return map;
  }, [availableSlots]);

  // Get days in current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Add days from previous month to fill first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Add days from next month to complete last week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: new Date(year, month + 1, i),
          isCurrentMonth: false,
        });
      }
    }

    return days;
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return formatDateKey(date) === formatDateKey(today);
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const slotsForSelectedDate = selectedDate
    ? availabilityMap.get(selectedDate) || []
    : [];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Calendar */}
      <AnimatedCard className="p-4" hoverEffect={false}>
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dateKey = formatDateKey(date);
            const hasSlots = availabilityMap.has(dateKey);
            const isSelected = selectedDate === dateKey;
            const dayIsPast = isPast(date);

            return (
              <button
                key={index}
                onClick={() => hasSlots && onSelectSlot(dateKey, "")}
                disabled={!hasSlots || dayIsPast || isLoading}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all",
                  !isCurrentMonth &&
                    !hasSlots &&
                    "text-gray-300 dark:text-gray-700",
                  isCurrentMonth &&
                    !hasSlots &&
                    "text-gray-400 dark:text-gray-600",
                  hasSlots &&
                    !isSelected &&
                    "text-gray-900 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer",
                  isSelected && "bg-purple-600 text-white hover:bg-purple-700",
                  isToday(date) && !isSelected && "ring-2 ring-purple-400",
                  dayIsPast && "opacity-50 cursor-not-allowed",
                  hasSlots && !isSelected && !dayIsPast && "font-medium"
                )}
              >
                <span>{date.getDate()}</span>
                {hasSlots && !dayIsPast && (
                  <span
                    className={cn(
                      "w-1 h-1 rounded-full mt-0.5",
                      isSelected ? "bg-white" : "bg-green-500"
                    )}
                  />
                )}
              </button>
            );
          })}
        </div>

        {isLoading && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Loading availability...
          </div>
        )}
      </AnimatedCard>

      {/* Time Slots */}
      <AnimatedCard className="p-4" hoverEffect={false}>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          {selectedDate
            ? `Available Times - ${new Date(
                selectedDate + "T00:00:00"
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}`
            : "Select a Date"}
        </h3>

        {selectedDate ? (
          slotsForSelectedDate.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slotsForSelectedDate.map((time) => {
                const isSelectedTime = selectedTime === time;
                const displayTime = new Date(
                  `2000-01-01T${time}`
                ).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                });

                return (
                  <button
                    key={time}
                    onClick={() => onSelectSlot(selectedDate, time)}
                    className={cn(
                      "px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1",
                      isSelectedTime
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                    )}
                  >
                    {displayTime}
                    {isSelectedTime && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No available slots for this date
            </p>
          )
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            Please select a date from the calendar to see available times
          </p>
        )}
      </AnimatedCard>
    </div>
  );
}
