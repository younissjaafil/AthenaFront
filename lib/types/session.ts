// Session Status
export type SessionStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

// Payment Status
export type PaymentStatus = "not_required" | "pending" | "paid" | "refunded";

// Video Provider
export type VideoProvider = "jitsi" | "daily";

// Day of Week
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

// Session Response
export interface Session {
  id: string;
  userId: string;
  creatorId: string;
  creatorName?: string;
  studentName?: string;
  scheduledAt: string;
  durationMinutes: number;
  status: SessionStatus;
  videoProvider: VideoProvider;
  videoRoomUrl?: string;
  videoRoomId?: string;
  price?: number;
  currency?: string;
  studentNotes?: string;
  creatorNotes?: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  canAccessMeeting: boolean;
}

// Book Session DTO
export interface BookSessionDto {
  creatorId: string;
  scheduledAt: string;
  durationMinutes: number;
  videoProvider?: VideoProvider;
  price?: number;
  currency?: string;
  studentNotes?: string;
}

// Update Session Status DTO
export interface UpdateSessionStatusDto {
  status: SessionStatus;
  cancellationReason?: string;
  creatorNotes?: string;
}

// Availability Time Slot
export interface TimeSlot {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

// Set Availability DTO
export interface SetAvailabilityDto {
  slots: TimeSlot[];
}

// Availability Response
export interface AvailabilitySlot {
  id: string;
  creatorId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

// Date-specific availability override (for one-time availability or blocks)
export interface DateOverride {
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
  isAvailable: boolean; // true = available, false = blocked
}

// Available Slots Response
export interface AvailableSlotsForDate {
  date: string;
  slots: string[];
  timezone?: string; // Creator's timezone
}

// Session Settings
export interface SessionSettings {
  id: string;
  creatorId: string;
  sessionDurations: number[];
  defaultDuration: number;
  bufferTime: number;
  minimumNoticeHours: number;
  maxAdvanceBookingDays: number;
  autoConfirm: boolean;
  allowFreeSession: boolean;
  pricePerDuration?: Record<string, number>;
  timezone: string;
  welcomeMessage?: string;
  cancellationPolicy?: string;
}

// Update Session Settings DTO
export interface UpdateSessionSettingsDto {
  sessionDurations?: number[];
  defaultDuration?: number;
  bufferTime?: number;
  minimumNoticeHours?: number;
  maxAdvanceBookingDays?: number;
  autoConfirm?: boolean;
  allowFreeSession?: boolean;
  pricePerDuration?: Record<string, number>;
  timezone?: string;
  welcomeMessage?: string;
  cancellationPolicy?: string;
}

// Helper to get status color
export function getSessionStatusColor(status: SessionStatus): string {
  const colors: Record<SessionStatus, string> = {
    pending: "warning",
    confirmed: "success",
    in_progress: "primary",
    completed: "info",
    cancelled: "danger",
    no_show: "default",
  };
  return colors[status] || "default";
}

// Helper to get status label
export function getSessionStatusLabel(status: SessionStatus): string {
  const labels: Record<SessionStatus, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    no_show: "No Show",
  };
  return labels[status] || status;
}

// Helper to format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Helper to check if session can be joined
export function canJoinSession(session: Session): boolean {
  // Must have meeting access (payment complete or free session)
  if (!session.canAccessMeeting) {
    return false;
  }

  if (session.status !== "confirmed" && session.status !== "in_progress") {
    return false;
  }

  const now = new Date();
  const scheduledAt = new Date(session.scheduledAt);
  const sessionEnd = new Date(
    scheduledAt.getTime() + session.durationMinutes * 60000
  );

  // Can join 5 minutes before start until session ends
  const joinWindow = new Date(scheduledAt.getTime() - 5 * 60000);
  return now >= joinWindow && now <= sessionEnd;
}

// Helper to check if session needs payment
export function sessionNeedsPayment(session: Session): boolean {
  return session.status === "confirmed" && session.paymentStatus === "pending";
}
