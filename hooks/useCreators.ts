"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_ATHENA_CORE_URL;

export interface Creator {
  id: string;
  userId: string;
  title: string;
  bio?: string;
  tagline?: string;
  specialties: string[];
  categories: string[];
  expertiseLevel: "beginner" | "intermediate" | "expert" | "master";
  hourlyRate: number;
  minimumBooking: number;
  websiteUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  githubUrl?: string;
  status: "pending" | "verified" | "suspended";
  isAvailable: boolean;
  totalAgents: number;
  totalSessions: number;
  averageRating: number;
  totalReviews: number;
  user?: {
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreatorAgent {
  id: string;
  creatorId: string;
  name: string;
  description?: string;
  model: string;
  category: string[];
  tags: string[];
  pricePerMessage: number;
  pricePerConversation: number;
  isFree: boolean;
  isPublic: boolean;
  status: string;
  profileImageUrl?: string;
  totalConversations: number;
  totalMessages: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    userId: string;
    bio?: string;
    specialties: string[];
    averageRating: number;
  };
}

export interface CreatorDocument {
  id: string;
  agentId: string;
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  s3Url?: string;
  status: string;
  chunkCount: number;
  embeddingCount: number;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

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

export const creatorKeys = {
  all: ["creators"] as const,
  verified: ["creators", "verified"] as const,
  available: ["creators", "available"] as const,
  detail: (id: string) => ["creators", id] as const,
  me: ["creators", "me"] as const,
  agents: (creatorId: string) => ["creators", creatorId, "agents"] as const,
  documents: (creatorId: string) =>
    ["creators", creatorId, "documents"] as const,
  sessionSettings: (creatorId: string) =>
    ["creators", creatorId, "sessions", "settings"] as const,
};

// Get all verified creators (public)
export function useVerifiedCreators() {
  return useQuery({
    queryKey: creatorKeys.verified,
    queryFn: async () => {
      const response = await axios.get<Creator[]>(`${API_URL}/api/creators`);
      return response.data;
    },
  });
}

// Get available creators (public)
export function useAvailableCreators() {
  return useQuery({
    queryKey: creatorKeys.available,
    queryFn: async () => {
      const response = await axios.get<Creator[]>(
        `${API_URL}/api/creators/available`
      );
      return response.data;
    },
  });
}

// Get creator by ID (public)
export function useCreator(creatorId: string) {
  return useQuery({
    queryKey: creatorKeys.detail(creatorId),
    queryFn: async () => {
      const response = await axios.get<Creator>(
        `${API_URL}/api/creators/${creatorId}`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Get my creator profile (authenticated)
export function useMyCreatorProfile() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: creatorKeys.me,
    queryFn: async () => {
      const response = await apiClient.get<Creator>("/api/creators/me");
      return response.data;
    },
  });
}

// Get creator's public agents
export function useCreatorAgents(
  creatorId: string,
  visibility: "public" | "all" = "public"
) {
  return useQuery({
    queryKey: [...creatorKeys.agents(creatorId), visibility],
    queryFn: async () => {
      const response = await axios.get<CreatorAgent[]>(
        `${API_URL}/api/creators/${creatorId}/agents`,
        { params: { visibility } }
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Get creator's public documents
export function useCreatorDocuments(
  creatorId: string,
  visibility: "public" | "all" = "public"
) {
  return useQuery({
    queryKey: [...creatorKeys.documents(creatorId), visibility],
    queryFn: async () => {
      const response = await axios.get<CreatorDocument[]>(
        `${API_URL}/api/creators/${creatorId}/documents`,
        { params: { visibility } }
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Get creator's session settings
export function useCreatorSessionSettings(creatorId: string) {
  return useQuery({
    queryKey: creatorKeys.sessionSettings(creatorId),
    queryFn: async () => {
      const response = await axios.get<SessionSettings>(
        `${API_URL}/api/creators/${creatorId}/sessions/settings`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Become a creator (create creator profile)
export function useBecomeCreator() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      bio?: string;
      tagline?: string;
      specialties?: string[];
      categories?: string[];
      expertiseLevel?: string;
      hourlyRate?: number;
    }) => {
      const response = await apiClient.post<Creator>("/api/creators", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.me });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

// Update my creator profile
export function useUpdateCreatorProfile() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title?: string;
      bio?: string;
      tagline?: string;
      specialties?: string[];
      categories?: string[];
      expertiseLevel?: string;
      hourlyRate?: number;
      websiteUrl?: string;
      linkedinUrl?: string;
      twitterUrl?: string;
      githubUrl?: string;
      isAvailable?: boolean;
    }) => {
      const response = await apiClient.patch<Creator>("/api/creators/me", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: creatorKeys.me });
    },
  });
}
