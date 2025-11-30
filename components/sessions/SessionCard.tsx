"use client";

import { AnimatedCard } from "@/components/ui/animated-card";
import { SessionStatusBadge } from "./SessionStatusBadge";
import {
  type Session,
  formatDuration,
  canJoinSession,
} from "@/lib/types/session";
import { Calendar, Clock, Video, User, ExternalLink } from "lucide-react";
import Link from "next/link";

interface SessionCardProps {
  session: Session;
  variant?: "student" | "creator";
  onConfirm?: () => void;
  onCancel?: () => void;
  onJoin?: () => void;
}

export function SessionCard({
  session,
  variant = "student",
  onConfirm,
  onCancel,
  onJoin,
}: SessionCardProps) {
  const scheduledDate = new Date(session.scheduledAt);
  const canJoin = canJoinSession(session);

  const formattedDate = scheduledDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  const formattedTime = scheduledDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const handleJoinClick = () => {
    if (session.videoRoomUrl) {
      window.open(session.videoRoomUrl, "_blank", "noopener,noreferrer");
    }
    onJoin?.();
  };

  return (
    <AnimatedCard className="p-4 sm:p-5" hoverEffect={false}>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {variant === "student" && session.creatorName
                ? `Session with ${session.creatorName}`
                : variant === "creator" && session.studentName
                ? `Session with ${session.studentName}`
                : "Session"}
            </h3>
            {variant === "student" && session.creatorName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <User className="w-3.5 h-3.5" />
                {session.creatorName}
              </p>
            )}
          </div>
          <SessionStatusBadge status={session.status} />
        </div>

        {/* Details */}
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-300">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-500" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-500" />
            {formattedTime} · {formatDuration(session.durationMinutes)}
          </span>
          <span className="flex items-center gap-1.5">
            <Video className="w-4 h-4 text-blue-500" />
            {session.videoProvider === "jitsi" ? "Jitsi Meet" : "Daily.co"}
          </span>
        </div>

        {/* Description */}
        {session.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {session.description}
          </p>
        )}

        {/* Price */}
        {session.price && session.price > 0 && (
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
            ${session.price} {session.currency || "USD"}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          {/* Join Session Button */}
          {canJoin && session.videoRoomUrl && (
            <button
              onClick={handleJoinClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Video className="w-4 h-4" />
              Join Session
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Confirm Button (Creator only for pending sessions) */}
          {variant === "creator" &&
            session.status === "pending" &&
            onConfirm && (
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
            )}

          {/* Cancel Button */}
          {(session.status === "pending" || session.status === "confirmed") &&
            onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}

          {/* View Details Link */}
          <Link
            href={
              variant === "creator"
                ? `/creator/sessions/${session.id}`
                : `/student/sessions/${session.id}`
            }
            className="px-4 py-2 text-purple-600 dark:text-purple-400 text-sm font-medium hover:underline"
          >
            View Details
          </Link>
        </div>
      </div>
    </AnimatedCard>
  );
}
