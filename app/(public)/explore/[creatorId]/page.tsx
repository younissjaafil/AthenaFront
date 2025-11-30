"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreator } from "@/hooks/useCreators";
import {
  useCreatorAvailability,
  useAvailableSlots,
  useBookSession,
  useCreatorSessionSettings,
} from "@/hooks/useSessions";
import { useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function CreatorBookingPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;
  const { isSignedIn } = useAuth();

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [notes, setNotes] = useState("");
  const [bookingStep, setBookingStep] = useState<"select" | "confirm">(
    "select"
  );

  const { data: creator, isLoading: creatorLoading } = useCreator(creatorId);
  const { data: availability } = useCreatorAvailability(creatorId);
  const { data: settings } = useCreatorSessionSettings(creatorId);

  // Calculate date range (next 30 days)
  const dateRange = useMemo(() => {
    const start = new Date();
    start.setDate(start.getDate() + 1); // Start from tomorrow
    const end = new Date();
    end.setDate(end.getDate() + (settings?.maxAdvanceBookingDays || 30));
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [settings]);

  const { data: slots } = useAvailableSlots(
    creatorId,
    dateRange.startDate,
    dateRange.endDate,
    selectedDuration
  );

  const bookSession = useBookSession();

  const fullName =
    creator?.user?.firstName && creator?.user?.lastName
      ? `${creator.user.firstName} ${creator.user.lastName}`
      : creator?.title || "Creator";

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      await bookSession.mutateAsync({
        creatorId,
        scheduledAt: `${selectedDate}T${selectedTime}:00.000Z`,
        durationMinutes: selectedDuration,
        notes: notes || undefined,
      });

      router.push("/student/chats?tab=sessions&booked=true");
    } catch (error) {
      console.error("Booking failed:", error);
    }
  };

  if (creatorLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-8" />
          <div className="h-64 bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="heading-1 mb-4">Creator not found</h1>
        <Link href="/explore" className="btn-secondary">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Back link */}
      <Link
        href="/explore"
        className="text-gray-400 hover:text-white mb-6 inline-flex items-center gap-2"
      >
        ← Back to Explore
      </Link>

      {/* Creator Header */}
      <div className="card p-6 mb-8">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-brand-purple-400 to-brand-teal-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
            {creator.user?.profileImageUrl ? (
              <img
                src={creator.user.profileImageUrl}
                alt={fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              fullName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <h1 className="heading-2 mb-1">{fullName}</h1>
            <p className="text-brand-purple-400 mb-2">{creator.title}</p>
            {creator.tagline && (
              <p className="text-gray-400 mb-4">{creator.tagline}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {creator.specialties?.map((specialty) => (
                <span
                  key={specialty}
                  className="px-3 py-1 text-sm rounded-full bg-brand-purple-400/10 text-brand-purple-400"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right">
            {creator.sessionRate && (
              <div className="text-2xl font-bold text-brand-teal-400">
                ${creator.sessionRate}
              </div>
            )}
            <div className="text-gray-400 text-sm">per session</div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      {!isSignedIn ? (
        <div className="card p-8 text-center">
          <h3 className="heading-3 mb-4">Sign in to book a session</h3>
          <p className="text-gray-400 mb-6">
            Create an account or sign in to book a 1-on-1 session with{" "}
            {fullName}
          </p>
          <SignInButton mode="modal">
            <button className="btn-primary">Sign In</button>
          </SignInButton>
        </div>
      ) : bookingStep === "select" ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Duration Selection */}
          <div className="card p-6">
            <h3 className="heading-3 mb-4">Select Duration</h3>
            <div className="grid grid-cols-2 gap-3">
              {(settings?.sessionDurations || [30, 60]).map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedDuration === duration
                      ? "border-brand-purple-400 bg-brand-purple-400/10"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="text-lg font-semibold">{duration} min</div>
                  {settings?.pricePerDuration?.[duration] && (
                    <div className="text-sm text-brand-teal-400">
                      ${settings.pricePerDuration[duration]}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="card p-6">
            <h3 className="heading-3 mb-4">Select Date</h3>
            {slots && slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {slots.map((slot) => (
                  <button
                    key={slot.date}
                    onClick={() => {
                      setSelectedDate(slot.date);
                      setSelectedTime("");
                    }}
                    className={`p-2 rounded-lg text-sm transition-all ${
                      selectedDate === slot.date
                        ? "bg-brand-purple-400 text-white"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    {new Date(slot.date + "T00:00:00").toLocaleDateString(
                      "en-US",
                      {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      }
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                No available dates
              </p>
            )}
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="card p-6 md:col-span-2">
              <h3 className="heading-3 mb-4">
                Select Time for{" "}
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {slots
                  ?.find((s) => s.date === selectedDate)
                  ?.slots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        selectedTime === time
                          ? "bg-brand-purple-400 text-white"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedTime && (
            <div className="card p-6 md:col-span-2">
              <h3 className="heading-3 mb-4">Add a note (optional)</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full p-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-brand-purple-400 focus:outline-none resize-none"
                rows={3}
              />

              <button
                onClick={() => setBookingStep("confirm")}
                className="btn-primary w-full mt-4"
              >
                Continue to Confirm
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Confirmation Step */
        <div className="card p-6">
          <h3 className="heading-2 mb-6">Confirm Your Booking</h3>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Creator</span>
              <span className="font-medium">{fullName}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Date</span>
              <span className="font-medium">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString(
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
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Time</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-700">
              <span className="text-gray-400">Duration</span>
              <span className="font-medium">{selectedDuration} minutes</span>
            </div>
            {notes && (
              <div className="py-3 border-b border-gray-700">
                <span className="text-gray-400 block mb-2">Notes</span>
                <p className="text-sm">{notes}</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setBookingStep("select")}
              className="btn-secondary flex-1"
            >
              Back
            </button>
            <button
              onClick={handleBooking}
              disabled={bookSession.isPending}
              className="btn-primary flex-1"
            >
              {bookSession.isPending ? "Booking..." : "Confirm Booking"}
            </button>
          </div>

          {bookSession.isError && (
            <p className="text-red-400 text-center mt-4">
              Failed to book session. Please try again.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
