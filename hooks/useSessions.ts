"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import axios from "axios";
import type {
  Session,
  BookSessionDto,
  UpdateSessionStatusDto,
  AvailabilitySlot,
  SetAvailabilityDto,
  AvailableSlotsForDate,
  SessionSettings,
  UpdateSessionSettingsDto,
} from "@/lib/types/session";

const API_URL = process.env.NEXT_PUBLIC_ATHENA_CORE_URL;
const API_BASE = `${API_URL}/api`;

// Query keys
export const sessionKeys = {
  all: ["sessions"] as const,
  mySessions: ["sessions", "my-sessions"] as const,
  upcoming: ["sessions", "upcoming"] as const,
  creatorSessions: (creatorId: string) =>
    ["sessions", "creator", creatorId] as const,
  detail: (id: string) => ["sessions", id] as const,
  availability: (creatorId: string) =>
    ["availability", "creator", creatorId] as const,
  myAvailability: ["availability", "my"] as const,
  availableSlots: (
    creatorId: string,
    startDate: string,
    endDate: string,
    duration?: number
  ) =>
    ["availability", "slots", creatorId, startDate, endDate, duration] as const,
  settings: (creatorId: string) => ["session-settings", creatorId] as const,
  mySettings: ["session-settings", "my"] as const,
};

// ===== SESSION HOOKS =====

// Get my sessions
export function useMySessions() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.mySessions,
    queryFn: async () => {
      const response = await apiClient.get<Session[]>("/api/sessions/me");
      return response.data;
    },
  });
}

// Get upcoming sessions
export function useUpcomingSessions() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.upcoming,
    queryFn: async () => {
      const response = await apiClient.get<Session[]>("/api/sessions/upcoming");
      return response.data;
    },
  });
}

// Get creator sessions
export function useCreatorSessions(creatorId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.creatorSessions(creatorId),
    queryFn: async () => {
      const response = await apiClient.get<Session[]>(
        `/api/sessions/creator/${creatorId}`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Get session by ID
export function useSession(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.detail(sessionId),
    queryFn: async () => {
      const response = await apiClient.get<Session>(
        `/api/sessions/${sessionId}`
      );
      return response.data;
    },
    enabled: !!sessionId,
  });
}

// Book session
export function useBookSession() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BookSessionDto) => {
      const response = await apiClient.post<Session>(
        "/api/sessions/book",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySessions });
      queryClient.invalidateQueries({ queryKey: sessionKeys.upcoming });
    },
  });
}

// Update session status
export function useUpdateSessionStatus(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSessionStatusDto) => {
      const response = await apiClient.patch<Session>(
        `/api/sessions/${sessionId}/status`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySessions });
      queryClient.invalidateQueries({ queryKey: sessionKeys.upcoming });
    },
  });
}

// Confirm session (creator)
export function useConfirmSession(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<Session>(
        `/api/sessions/${sessionId}/status`,
        { status: "confirmed" }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySessions });
    },
  });
}

// Start session
export function useStartSession(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<Session>(
        `/api/sessions/${sessionId}/start`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
    },
  });
}

// Complete session
export function useCompleteSession(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch<Session>(
        `/api/sessions/${sessionId}/complete`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySessions });
    },
  });
}

// Cancel session
export function useCancelSession(sessionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reason?: string) => {
      const response = await apiClient.patch<Session>(
        `/api/sessions/${sessionId}/cancel`,
        null,
        { params: { reason } }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sessionKeys.detail(sessionId),
      });
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySessions });
      queryClient.invalidateQueries({ queryKey: sessionKeys.upcoming });
    },
  });
}

// ===== AVAILABILITY HOOKS =====

// Get my availability (creator)
export function useMyAvailability() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.myAvailability,
    queryFn: async () => {
      const response = await apiClient.get<AvailabilitySlot[]>(
        "/api/availability/me"
      );
      return response.data;
    },
  });
}

// Get creator availability (public)
export function useCreatorAvailability(creatorId: string) {
  return useQuery({
    queryKey: sessionKeys.availability(creatorId),
    queryFn: async () => {
      const response = await axios.get<AvailabilitySlot[]>(
        `${API_BASE}/availability/creator/${creatorId}`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Set availability
export function useSetAvailability() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SetAvailabilityDto) => {
      const response = await apiClient.post<AvailabilitySlot[]>(
        "/api/availability",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.myAvailability });
    },
  });
}

// Get available slots for booking
export function useAvailableSlots(
  creatorId: string,
  startDate: string,
  endDate: string,
  duration?: number
) {
  return useQuery({
    queryKey: sessionKeys.availableSlots(
      creatorId,
      startDate,
      endDate,
      duration
    ),
    queryFn: async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
        ...(duration && { duration: duration.toString() }),
      });
      const response = await axios.get<AvailableSlotsForDate[]>(
        `${API_BASE}/availability/slots/${creatorId}?${params}`
      );
      return response.data;
    },
    enabled: !!creatorId && !!startDate && !!endDate,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: true,
  });
}

// ===== SESSION SETTINGS HOOKS =====

// Get my session settings (creator)
export function useMySessionSettings() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: sessionKeys.mySettings,
    queryFn: async () => {
      const response = await apiClient.get<SessionSettings>(
        "/api/availability/settings"
      );
      return response.data;
    },
  });
}

// Get creator session settings (public)
export function useCreatorSessionSettings(creatorId: string) {
  return useQuery({
    queryKey: sessionKeys.settings(creatorId),
    queryFn: async () => {
      const response = await axios.get<SessionSettings>(
        `${API_BASE}/availability/settings/${creatorId}`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Update session settings
export function useUpdateSessionSettings() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateSessionSettingsDto) => {
      const response = await apiClient.patch<SessionSettings>(
        "/api/availability/settings",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKeys.mySettings });
    },
  });
}

// ===== DATE OVERRIDE HOOKS =====

// Get my date overrides (creator)
export function useMyDateOverrides() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: ["date-overrides", "my"],
    queryFn: async () => {
      const response = await apiClient.get<
        {
          id: string;
          date: string;
          startTime: string | null;
          endTime: string | null;
          isAvailable: boolean;
        }[]
      >("/api/availability/overrides");
      return response.data;
    },
  });
}

// Set date overrides
export function useSetDateOverrides() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      overrides: {
        date: string;
        startTime?: string;
        endTime?: string;
        isAvailable: boolean;
      }[]
    ) => {
      const response = await apiClient.post("/api/availability/overrides", {
        overrides,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["date-overrides", "my"] });
      queryClient.invalidateQueries({ queryKey: ["availability"] });
    },
  });
}
