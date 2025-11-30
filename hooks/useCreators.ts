"use client";

import { useQuery } from "@tanstack/react-query";
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
  hourlyRate?: number;
  sessionRate?: number;
  currency: string;
  status: "pending" | "verified" | "suspended";
  isAvailable: boolean;
  totalEarnings: number;
  totalSessions: number;
  averageRating?: number;
  totalReviews: number;
  socialLinks?: Record<string, string>;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImageUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const creatorKeys = {
  all: ["creators"] as const,
  verified: ["creators", "verified"] as const,
  available: ["creators", "available"] as const,
  detail: (id: string) => ["creators", id] as const,
  me: ["creators", "me"] as const,
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
