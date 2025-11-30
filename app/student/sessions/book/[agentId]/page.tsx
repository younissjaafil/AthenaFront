"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { CalendarBooking } from "@/components/sessions";
import {
  useAvailableSlots,
  useCreatorSessionSettings,
  useBookSession,
} from "@/hooks/useSessions";
import { useAgent } from "@/hooks/useAgents";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Video,
  Check,
  Loader2,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { formatDuration } from "@/lib/types/session";

export default function BookSessionPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<"select" | "confirm">("select");

  // Get agent/creator info
  const { data: agent, isLoading: loadingAgent } = useAgent(agentId);

  // Get session settings
  const { data: settings, isLoading: loadingSettings } =
    useCreatorSessionSettings(agent?.creatorId || "");

  // Calculate date range (next 30 days or based on settings)
  const dateRange = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1); // Start from tomorrow
    const end = new Date();
    end.setDate(end.getDate() + (settings?.maxAdvanceBookingDays || 30));

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [settings?.maxAdvanceBookingDays]);

  // Get available slots
  const { data: availableSlots, isLoading: loadingSlots } = useAvailableSlots(
    agent?.creatorId || "",
    dateRange.startDate,
    dateRange.endDate,
    selectedDuration
  );

  // Book session mutation
  const bookSession = useBookSession();

  const handleSelectSlot = (date: string, time: string) => {
    setSelectedDate(date);
    if (time) {
      setSelectedTime(time);
    }
  };

  const handleContinue = () => {
    if (selectedDate && selectedTime) {
      setStep("confirm");
    }
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !agent?.creatorId) return;

    // Find the timezone from the available slots for this date
    const slotData = availableSlots?.find((s) => s.date === selectedDate);
    const creatorTimezone = slotData?.timezone || settings?.timezone || "UTC";

    // Create the datetime string with the creator's timezone
    // The slot time (e.g., "02:00") is in the creator's timezone
    // We need to send it as an ISO string that the backend understands
    const dateTimeStr = `${selectedDate}T${selectedTime}:00`;

    // Get the offset for the creator's timezone
    const tempDate = new Date(dateTimeStr + "Z"); // Treat as UTC first
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: creatorTimezone,
      hour: "numeric",
      hour12: false,
    });

    // Calculate offset by checking what hour noon UTC shows as in the target timezone
    const testDate = new Date(`${selectedDate}T12:00:00Z`);
    const localHour = parseInt(formatter.format(testDate));
    const offsetHours = localHour - 12;

    // Adjust the time to get UTC
    const [hours, minutes] = selectedTime.split(":").map(Number);
    const utcHours = hours - offsetHours;

    // Handle day wraparound
    let adjustedDate = selectedDate;
    let adjustedHours = utcHours;
    if (utcHours < 0) {
      adjustedHours = utcHours + 24;
      const d = new Date(selectedDate);
      d.setDate(d.getDate() - 1);
      adjustedDate = d.toISOString().split("T")[0];
    } else if (utcHours >= 24) {
      adjustedHours = utcHours - 24;
      const d = new Date(selectedDate);
      d.setDate(d.getDate() + 1);
      adjustedDate = d.toISOString().split("T")[0];
    }

    const scheduledAt = `${adjustedDate}T${adjustedHours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00.000Z`;

    try {
      await bookSession.mutateAsync({
        creatorId: agent.creatorId,
        scheduledAt,
        durationMinutes: selectedDuration,
        studentNotes: notes || undefined,
        price: settings?.pricePerDuration?.[selectedDuration.toString()],
        currency: "USD",
      });

      router.push("/student/sessions?booked=true");
    } catch (error) {
      console.error("Failed to book session:", error);
    }
  };

  const isLoading = loadingAgent || loadingSettings || loadingSlots;

  // Calculate price
  const price = settings?.pricePerDuration?.[selectedDuration.toString()];

  if (loadingAgent) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
        <AnimatedCard className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Agent not found
          </h2>
          <p className="text-gray-500 mb-4">
            The agent you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link href="/explore" className="text-purple-600 hover:underline">
            Back to Explore
          </Link>
        </AnimatedCard>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Book a Session
        </motion.h1>

        {/* Agent Info */}
        <AnimatedCard className="p-4 flex items-center gap-4 mt-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {agent.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {agent.description?.slice(0, 80)}...
            </p>
          </div>
        </AnimatedCard>
      </div>

      {step === "select" ? (
        <>
          {/* Duration Selection */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-3">
              Session Duration
            </h3>
            <div className="flex gap-2">
              {(settings?.sessionDurations || [30, 60]).map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedDuration === duration
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                  }`}
                >
                  {formatDuration(duration)}
                  {settings?.pricePerDuration?.[duration.toString()] && (
                    <span className="ml-2 text-sm opacity-80">
                      ${settings.pricePerDuration[duration.toString()]}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <CalendarBooking
            availableSlots={availableSlots || []}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectSlot={handleSelectSlot}
            isLoading={loadingSlots}
          />

          {/* Continue Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!selectedDate || !selectedTime}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </>
      ) : (
        /* Confirmation Step */
        <div className="space-y-6">
          <AnimatedCard className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Session Details
            </h3>

            <div className="space-y-4">
              {/* Date & Time */}
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span>
                  {selectedDate &&
                    new Date(selectedDate + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-teal-500" />
                <span>
                  {selectedTime &&
                    new Date(`2000-01-01T${selectedTime}`).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "numeric",
                        minute: "2-digit",
                        hour12: true,
                      }
                    )}{" "}
                  ({formatDuration(selectedDuration)})
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Video className="w-5 h-5 text-blue-500" />
                <span>Jitsi Meet (link will be provided)</span>
              </div>

              {price && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">${price} USD</span>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Notes */}
          <AnimatedCard className="p-6" delay={0.1}>
            <label className="block font-medium text-gray-900 dark:text-white mb-2">
              Notes for the Creator (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to discuss? Any questions or topics you want to cover?"
              rows={4}
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </AnimatedCard>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <button
              onClick={() => setStep("select")}
              className="px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleBook}
              disabled={bookSession.isPending}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {bookSession.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Confirm Booking
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
