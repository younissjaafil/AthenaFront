"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { SessionStatusBadge, CancelSessionModal } from "@/components/sessions";
import { JitsiMeet } from "@/components/sessions/JitsiMeet";
import {
  useSession,
  useConfirmSession,
  useCancelSession,
  useStartSession,
  useCompleteSession,
} from "@/hooks/useSessions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  MessageSquare,
  Loader2,
  ExternalLink,
  X,
  Check,
} from "lucide-react";
import Link from "next/link";
import { formatDuration, canJoinSession } from "@/lib/types/session";

export default function CreatorSessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;

  const [showVideo, setShowVideo] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: session, isLoading, error } = useSession(sessionId);

  // Prevent rendering during build/prerender
  if (typeof window === "undefined") {
    return null;
  }

  const confirmSession = useConfirmSession(sessionId);
  const cancelSession = useCancelSession(sessionId);
  const startSession = useStartSession(sessionId);
  const completeSession = useCompleteSession(sessionId);

  const canJoin = session ? canJoinSession(session) : false;

  const handleConfirm = async () => {
    try {
      await confirmSession.mutateAsync();
    } catch (error) {
      console.error("Failed to confirm:", error);
    }
  };

  const handleCancel = async (reason?: string) => {
    try {
      await cancelSession.mutateAsync(reason);
      setShowCancelModal(false);
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  const handleStart = async () => {
    try {
      await startSession.mutateAsync();
      setShowVideo(true);
    } catch (error) {
      console.error("Failed to start:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeSession.mutateAsync();
      setShowVideo(false);
    } catch (error) {
      console.error("Failed to complete:", error);
    }
  };

  const handleJoinExternal = () => {
    if (session?.videoRoomUrl) {
      window.open(session.videoRoomUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
        <AnimatedCard className="p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Session not found
          </h2>
          <p className="text-gray-500 mb-4">
            The session you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/creator/sessions"
            className="text-purple-600 hover:underline"
          >
            Back to Sessions
          </Link>
        </AnimatedCard>
      </div>
    );
  }

  const scheduledDate = new Date(session.scheduledAt);

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-16 lg:pt-8">
      {/* Video Overlay */}
      {showVideo && session.videoRoomUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
          <div className="p-4 flex items-center justify-between bg-gray-900">
            <h2 className="text-white font-semibold">
              {session.studentName
                ? `Session with ${session.studentName}`
                : "Session"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinExternal}
                className="px-3 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-1"
              >
                Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </button>
              {session.status === "in_progress" && (
                <button
                  onClick={handleComplete}
                  disabled={completeSession.isPending}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  {completeSession.isPending
                    ? "Completing..."
                    : "Complete Session"}
                </button>
              )}
              <button
                onClick={() => setShowVideo(false)}
                className="p-2 text-white hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1">
            <JitsiMeet
              roomName={session.videoRoomId || session.id}
              displayName={user?.firstName || "Creator"}
              email={user?.email}
              onLeave={() => setShowVideo(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href="/creator/sessions"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sessions
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2"
            >
              {session.studentName
                ? `Session with ${session.studentName}`
                : "Session"}
            </motion.h1>
            <SessionStatusBadge status={session.status} size="lg" />
          </div>

          {/* Join Button */}
          {canJoin && session.videoRoomUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Video className="w-5 h-5" />
              Join Session
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Approval Banner */}
          {session.status === "pending" && (
            <AnimatedCard className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <h2 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Awaiting Your Confirmation
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm mb-4">
                This session is pending your approval. Review the details and
                confirm or decline.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirm}
                  disabled={confirmSession.isPending}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {confirmSession.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirm Session
                </button>
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelSession.isPending}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            </AnimatedCard>
          )}

          {/* Schedule Info */}
          <AnimatedCard className="p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Session Details
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Calendar className="w-5 h-5 text-purple-500" />
                <span>
                  {scheduledDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Clock className="w-5 h-5 text-teal-500" />
                <span>
                  {scheduledDate.toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}{" "}
                  · {formatDuration(session.durationMinutes)}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <Video className="w-5 h-5 text-blue-500" />
                <span>
                  {session.videoProvider === "jitsi"
                    ? "Jitsi Meet"
                    : "Daily.co"}
                </span>
              </div>

              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <User className="w-5 h-5 text-orange-500" />
                <span>Student ID: {session.userId}</span>
              </div>
            </div>
          </AnimatedCard>

          {/* Student Notes */}
          {session.studentNotes && (
            <AnimatedCard className="p-6" delay={0.2}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Notes from Student
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                {session.studentNotes}
              </p>
            </AnimatedCard>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <AnimatedCard className="p-6" delay={0.1}>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
              Actions
            </h2>

            <div className="space-y-3">
              {/* Join via new tab */}
              {canJoin && session.videoRoomUrl && (
                <button
                  onClick={handleJoinExternal}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </button>
              )}

              {/* Start Session */}
              {session.status === "confirmed" && canJoin && (
                <button
                  onClick={handleStart}
                  disabled={startSession.isPending}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {startSession.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  Start Session
                </button>
              )}

              {/* Complete */}
              {session.status === "in_progress" && (
                <button
                  onClick={handleComplete}
                  disabled={completeSession.isPending}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {completeSession.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Complete Session
                </button>
              )}

              {/* Cancel */}
              {(session.status === "pending" ||
                session.status === "confirmed") && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  disabled={cancelSession.isPending}
                  className="w-full px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {cancelSession.isPending ? "Cancelling..." : "Cancel Session"}
                </button>
              )}
            </div>
          </AnimatedCard>

          {/* Price */}
          {session.price && session.price > 0 && (
            <AnimatedCard className="p-6" delay={0.2}>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                Earnings
              </h2>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${session.price} {session.currency || "USD"}
              </p>
            </AnimatedCard>
          )}
        </div>
      </div>

      {/* Cancel Session Modal */}
      <CancelSessionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        isLoading={cancelSession.isPending}
        sessionWith={session.studentName}
      />
    </div>
  );
}
