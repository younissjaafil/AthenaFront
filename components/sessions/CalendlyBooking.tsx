"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";

interface CalendlyBookingProps {
  availableSlots: { date: string; slots: string[] }[];
  durations: number[];
  defaultDuration: number;
  pricePerDuration?: Record<number, number>;
  onBook: (date: string, time: string, duration: number) => void;
  isLoading?: boolean;
  creatorTimezone?: string;
}

export function CalendlyBooking({
  availableSlots,
  durations,
  defaultDuration,
  pricePerDuration,
  onBook,
  isLoading,
  creatorTimezone = "UTC",
}: CalendlyBookingProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState(defaultDuration);
  const [step, setStep] = useState<"date" | "time" | "confirm">("date");

  // Get available dates as a Set for quick lookup
  const availableDates = useMemo(() => {
    return new Set(availableSlots.map((s) => s.date));
  }, [availableSlots]);

  // Get slots for selected date
  const slotsForDate = useMemo(() => {
    if (!selectedDate) return [];
    return availableSlots.find((s) => s.date === selectedDate)?.slots || [];
  }, [availableSlots, selectedDate]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      isAvailable: boolean;
    }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, isAvailable: false });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = date.toISOString().split("T")[0];
      const isAvailable = availableDates.has(dateStr);
      days.push({ date, isCurrentMonth: true, isAvailable });
    }

    // Next month padding
    const remaining = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isAvailable: false });
    }

    return days;
  }, [currentMonth, availableDates]);

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime(null);
    setStep("time");
  };

  const handleTimeClick = (time: string) => {
    setSelectedTime(time);
    setStep("confirm");
  };

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      onBook(selectedDate, selectedTime, selectedDuration);
    }
  };

  const handleBack = () => {
    if (step === "time") {
      setStep("date");
      setSelectedTime(null);
    } else if (step === "confirm") {
      setStep("time");
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Duration selector */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Duration</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setSelectedDuration(duration)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedDuration === duration
                  ? "bg-purple-600 text-white"
                  : "bg-slate-800 text-gray-300 hover:bg-slate-700"
              }`}
            >
              {duration} min
              {pricePerDuration?.[duration] !== undefined && (
                <span className="ml-1 text-xs opacity-75">
                  {pricePerDuration[duration] === 0
                    ? "(Free)"
                    : `($${pricePerDuration[duration]})`}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar / Time Selection */}
      <div className="p-4">
        {step === "date" && (
          <>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold text-white">{monthName}</h3>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.setMonth(currentMonth.getMonth() + 1))
                  )
                }
                className="p-2 rounded-lg hover:bg-slate-800 text-gray-400 hover:text-white transition-colors"
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
              {calendarDays.map(({ date, isCurrentMonth, isAvailable }, i) => {
                const dateStr = date.toISOString().split("T")[0];
                const isToday =
                  dateStr === new Date().toISOString().split("T")[0];
                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                return (
                  <button
                    key={i}
                    onClick={() => isAvailable && handleDateClick(dateStr)}
                    disabled={!isAvailable || isPast}
                    className={`
                      aspect-square rounded-lg text-sm font-medium transition-all
                      ${!isCurrentMonth ? "text-gray-700" : ""}
                      ${isToday ? "ring-2 ring-purple-500/50" : ""}
                      ${
                        isAvailable && !isPast
                          ? "bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white cursor-pointer"
                          : "text-gray-600 cursor-not-allowed"
                      }
                      ${
                        selectedDate === dateStr
                          ? "bg-purple-600 text-white"
                          : ""
                      }
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {availableDates.size === 0 && (
              <p className="text-center text-gray-500 mt-4 text-sm">
                No available dates in this month
              </p>
            )}
          </>
        )}

        {step === "time" && selectedDate && (
          <>
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to calendar
            </button>

            <h3 className="text-lg font-semibold text-white mb-1">
              {formatDate(selectedDate)}
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Select a time ({selectedDuration} min session)
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {slotsForDate.map((time) => (
                <button
                  key={time}
                  onClick={() => handleTimeClick(time)}
                  className={`
                    px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${
                      selectedTime === time
                        ? "bg-purple-600 text-white"
                        : "bg-slate-800 text-gray-300 hover:bg-purple-600/50 hover:text-white"
                    }
                  `}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>

            {slotsForDate.length === 0 && (
              <p className="text-center text-gray-500 text-sm">
                No available times for this date
              </p>
            )}
          </>
        )}

        {step === "confirm" && selectedDate && selectedTime && (
          <>
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to times
            </button>

            <div className="bg-slate-800/50 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">
                Confirm your booking
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span>{formatDate(selectedDate)}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <span>
                    {formatTime(selectedTime)} · {selectedDuration} minutes
                  </span>
                </div>
                {pricePerDuration?.[selectedDuration] !== undefined && (
                  <div className="pt-2 border-t border-slate-700">
                    <span className="text-xl font-bold text-white">
                      {pricePerDuration[selectedDuration] === 0
                        ? "Free"
                        : `$${pricePerDuration[selectedDuration]}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading ? "Booking..." : "Confirm Booking"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
