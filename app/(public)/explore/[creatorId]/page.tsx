"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCreator } from "@/hooks/useCreators";
import {
  useAvailableSlots,
  useBookSession,
  useCreatorSessionSettings,
} from "@/hooks/useSessions";
import { useAuth, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { CalendlyBooking } from "@/components/sessions/CalendlyBooking";

export default function CreatorBookingPage() {
  const params = useParams();
  const router = useRouter();
  const creatorId = params.creatorId as string;
  const { isSignedIn } = useAuth();

  const { data: creator, isLoading: creatorLoading } = useCreator(creatorId);
  const { data: settings } = useCreatorSessionSettings(creatorId);

  // Calculate date range (next 60 days for more flexibility)
  const dateRange = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (settings?.maxAdvanceBookingDays || 60));
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  }, [settings]);

  // Fetch slots for default duration (will refetch when duration changes in component)
  const { data: slots, isLoading: slotsLoading } = useAvailableSlots(
    creatorId,
    dateRange.startDate,
    dateRange.endDate,
    settings?.defaultDuration || 15  // Use smallest duration to see more slots
  );

  // Debug logging
  console.log("Booking page debug:", {
    creatorId,
    dateRange,
    slots,
    slotsLoading,
    settings,
  });

  const bookSession = useBookSession();

  const fullName =
    creator?.user?.firstName && creator?.user?.lastName
      ? `${creator.user.firstName} ${creator.user.lastName}`
      : creator?.title || creator?.user?.email || "Creator";

  const handleBookSession = async (
    date: string,
    time: string,
    duration: number
  ) => {
    try {
      await bookSession.mutateAsync({
        creatorId,
        title: `Session with ${fullName}`,
        scheduledAt: `${date}T${time}:00.000Z`,
        durationMinutes: duration,
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
          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-brand-purple-400 to-brand-teal-400 flex items-center justify-center text-white text-3xl font-bold overflow-hidden relative">
            {creator.user?.profileImageUrl ? (
              <Image
                src={creator.user.profileImageUrl}
                alt={fullName}
                fill
                className="object-cover"
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
            {creator.hourlyRate > 0 && (
              <div className="text-2xl font-bold text-brand-teal-400">
                ${creator.hourlyRate}
              </div>
            )}
            <div className="text-gray-400 text-sm">per hour</div>
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
      ) : slotsLoading ? (
        <div className="card p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">Loading available times...</p>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h2 className="heading-3 mb-4 text-center">Book a Session</h2>
          <CalendlyBooking
            availableSlots={slots || []}
            durations={settings?.sessionDurations || [30, 60]}
            defaultDuration={60}
            pricePerDuration={settings?.pricePerDuration}
            onBook={handleBookSession}
            isLoading={bookSession.isPending}
            creatorTimezone={settings?.timezone || "UTC"}
          />
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
