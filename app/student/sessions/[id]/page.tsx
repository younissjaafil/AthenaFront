"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AnimatedCard } from "@/components/ui/animated-card";
import { SessionStatusBadge } from "@/components/sessions";
import { JitsiMeet } from "@/components/sessions/JitsiMeet";
import {
  useSession,
  useCancelSession,
  useStartSession,
  useCompleteSession,
} from "@/hooks/useSessions";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useCreateSessionPayment } from "@/hooks/usePayments";
import { PaymentCurrency } from "@/lib/types/payment";
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
  CreditCard,
  Lock,
} from "lucide-react";
import Link from "next/link";
import {
  formatDuration,
  canJoinSession,
  sessionNeedsPayment,
} from "@/lib/types/session";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [showVideo, setShowVideo] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: user } = useCurrentUser();
  const { data: session, isLoading, error, refetch } = useSession(sessionId);

  const cancelSession = useCancelSession(sessionId);
  const startSession = useStartSession(sessionId);
  const completeSession = useCompleteSession(sessionId);
  const createPayment = useCreateSessionPayment();

  const canJoin = session ? canJoinSession(session) : false;
  const needsPayment = session ? sessionNeedsPayment(session) : false;
  const isCreator = session?.creatorId === user?.creatorId;
  const isStudent = session?.userId === user?.id;

  const handleCancel = async () => {
    const reason = prompt("Reason for cancellation (optional):");
    try {
      await cancelSession.mutateAsync(reason || undefined);
    } catch (error) {
      console.error("Failed to cancel:", error);
    }
  };

  const handleStart = async () => {
    try {
      await startSession.mutateAsync();
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

  const handlePayment = async () => {
    if (!session?.price || !session?.currency) {
      console.error("Session has no price information");
      return;
    }

    setIsProcessingPayment(true);
    try {
      const result = await createPayment.mutateAsync({
        sessionId: session.id,
        data: {
          amount: session.price,
          currency: session.currency as PaymentCurrency,
          invoice: `Session with ${session.creatorName || "creator"}`,
        },
      });

      // Redirect to payment URL
      if (result.collectUrl) {
        window.location.href = result.collectUrl;
      }
    } catch (error) {
      console.error("Failed to create payment:", error);
      setIsProcessingPayment(false);
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
            href="/student/sessions"
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
              {session.creatorName
                ? `Session with ${session.creatorName}`
                : "Session"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleJoinExternal}
                className="px-3 py-1.5 text-sm text-white bg-gray-700 rounded-lg hover:bg-gray-600 flex items-center gap-1"
              >
                Open in New Tab <ExternalLink className="w-3.5 h-3.5" />
              </button>
              {isCreator && session.status === "in_progress" && (
                <button
                  onClick={handleComplete}
                  disabled={completeSession.isPending}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
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
              displayName={user?.firstName || "Participant"}
              email={user?.email}
              onLeave={() => setShowVideo(false)}
            />
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link
          href={isCreator ? "/creator/sessions" : "/student/sessions"}
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
              {session.creatorName
                ? `Session with ${session.creatorName}`
                : "Session"}
            </motion.h1>
            <SessionStatusBadge status={session.status} size="lg" />
          </div>

          {/* Join Button - only show if paid or free */}
          {canJoin && session.videoRoomUrl && (
            <button
              onClick={() => setShowVideo(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Video className="w-5 h-5" />
              Join Session
            </button>
          )}

          {/* Payment Required Button */}
          {needsPayment && isStudent && (
            <button
              onClick={handlePayment}
              disabled={isProcessingPayment}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isProcessingPayment ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              Pay {session.price} {session.currency} to Access
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
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

              {session.creatorName && !isCreator && (
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <User className="w-5 h-5 text-orange-500" />
                  <span>with {session.creatorName}</span>
                </div>
              )}
            </div>
          </AnimatedCard>

          {/* Notes */}
          {(session.studentNotes || session.creatorNotes) && (
            <AnimatedCard className="p-6" delay={0.2}>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Notes
                </h2>
              </div>

              {session.studentNotes && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    From Student:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {session.studentNotes}
                  </p>
                </div>
              )}

              {session.creatorNotes && (
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    From Creator:
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {session.creatorNotes}
                  </p>
                </div>
              )}
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

              {/* Start Session (Creator) */}
              {isCreator && session.status === "confirmed" && canJoin && (
                <button
                  onClick={handleStart}
                  disabled={startSession.isPending}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {startSession.isPending ? "Starting..." : "Start Session"}
                </button>
              )}

              {/* Cancel */}
              {(session.status === "pending" ||
                session.status === "confirmed") && (
                <button
                  onClick={handleCancel}
                  disabled={cancelSession.isPending}
                  className="w-full px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {cancelSession.isPending ? "Cancelling..." : "Cancel Session"}
                </button>
              )}
            </div>
          </AnimatedCard>

          {/* Price & Payment Status */}
          {session.price && session.price > 0 && (
            <AnimatedCard className="p-6" delay={0.2}>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-2">
                Payment
              </h2>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                {session.price} {session.currency || "USD"}
              </p>

              {/* Payment Status Badge */}
              {session.paymentStatus === "paid" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-medium">Payment Complete</span>
                </div>
              )}

              {session.paymentStatus === "pending" && isStudent && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg">
                    <Lock className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Payment Required
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Pay to unlock the meeting link
                  </p>
                  <button
                    onClick={handlePayment}
                    disabled={isProcessingPayment}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isProcessingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Pay Now
                  </button>
                </div>
              )}

              {session.paymentStatus === "not_required" && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">
                  <span className="text-sm">Free Session</span>
                </div>
              )}
            </AnimatedCard>
          )}
        </div>
      </div>
    </div>
  );
}
