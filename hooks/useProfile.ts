"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  UserProfile,
  CreateProfileDto,
  UpdateProfileDto,
  CreatorTestimonial,
  CreateTestimonialDto,
  UpdateTestimonialDto,
  TestimonialsStats,
} from "@/lib/types/profile";

// ==================== PROFILE HOOKS ====================

/**
 * Get profile by handle (public)
 */
export function useProfile(handle: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["profile", handle],
    queryFn: async (): Promise<UserProfile> => {
      const res = await apiClient.get(`/profiles/handle/${handle}`);
      return res.data;
    },
    enabled: enabled && !!handle,
  });
}

/**
 * Get profile by user ID
 */
export function useProfileByUserId(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["profile", "user", userId],
    queryFn: async (): Promise<UserProfile> => {
      const res = await apiClient.get(`/profiles/user/${userId}`);
      return res.data;
    },
    enabled: enabled && !!userId,
  });
}

/**
 * Get my profile (authenticated)
 */
export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async (): Promise<UserProfile> => {
      const res = await apiClient.get("/profiles/me");
      return res.data;
    },
  });
}

/**
 * Check if handle is available
 */
export function useCheckHandle(handle: string) {
  return useQuery({
    queryKey: ["profile", "check-handle", handle],
    queryFn: async (): Promise<{ available: boolean }> => {
      const res = await apiClient.get(`/profiles/check-handle/${handle}`);
      return res.data;
    },
    enabled: !!handle && handle.length >= 3,
  });
}

/**
 * Create profile
 */
export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProfileDto): Promise<UserProfile> => {
      const res = await apiClient.post("/profiles", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Update my profile
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileDto): Promise<UserProfile> => {
      const res = await apiClient.patch("/profiles/me", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ==================== FOLLOW HOOKS ====================

/**
 * Follow a user
 */
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await apiClient.post(`/profiles/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

/**
 * Unfollow a user
 */
export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string): Promise<void> => {
      await apiClient.delete(`/profiles/${userId}/follow`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
    },
  });
}

/**
 * Get followers of a user
 */
export function useFollowers(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: ["followers", userId, page, limit],
    queryFn: async (): Promise<{
      profiles: UserProfile[];
      total: number;
    }> => {
      const res = await apiClient.get(`/profiles/${userId}/followers`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!userId,
  });
}

/**
 * Get users that a user is following
 */
export function useFollowing(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: ["following", userId, page, limit],
    queryFn: async (): Promise<{
      profiles: UserProfile[];
      total: number;
    }> => {
      const res = await apiClient.get(`/profiles/${userId}/following`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!userId,
  });
}

// ==================== TESTIMONIAL HOOKS ====================

/**
 * Get testimonials for a creator
 */
export function useTestimonials(
  creatorId: string,
  page: number = 1,
  limit: number = 10
) {
  return useQuery({
    queryKey: ["testimonials", creatorId, page, limit],
    queryFn: async (): Promise<{
      testimonials: CreatorTestimonial[];
      total: number;
    }> => {
      const res = await apiClient.get(`/creators/${creatorId}/testimonials`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!creatorId,
  });
}

/**
 * Get testimonial stats for a creator
 */
export function useTestimonialStats(creatorId: string) {
  return useQuery({
    queryKey: ["testimonials", "stats", creatorId],
    queryFn: async (): Promise<TestimonialsStats> => {
      const res = await apiClient.get(
        `/creators/${creatorId}/testimonials/stats`
      );
      return res.data;
    },
    enabled: !!creatorId,
  });
}

/**
 * Create a testimonial
 */
export function useCreateTestimonial(creatorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      data: CreateTestimonialDto
    ): Promise<CreatorTestimonial> => {
      const res = await apiClient.post(
        `/creators/${creatorId}/testimonials`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Update a testimonial
 */
export function useUpdateTestimonial(creatorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      testimonialId,
      data,
    }: {
      testimonialId: string;
      data: UpdateTestimonialDto;
    }): Promise<CreatorTestimonial> => {
      const res = await apiClient.patch(
        `/creators/${creatorId}/testimonials/${testimonialId}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Delete a testimonial
 */
export function useDeleteTestimonial(creatorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (testimonialId: string): Promise<void> => {
      await apiClient.delete(
        `/creators/${creatorId}/testimonials/${testimonialId}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testimonials", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ==================== PROMOTE TO CREATOR ====================

/**
 * Promote current user to creator
 */
export function usePromoteToCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      bio?: string;
      tagline?: string;
    }): Promise<void> => {
      await apiClient.post("/creators", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["creators"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
