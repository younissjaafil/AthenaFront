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
  CreatorStats,
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

// ==================== CREATOR FOLLOW HOOKS ====================

/**
 * Follow a creator
 */
export function useFollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string): Promise<void> => {
      await apiClient.post(`/creators/${creatorId}/follow`);
    },
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ["creators", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["creatorStats", creatorId] });
      queryClient.invalidateQueries({
        queryKey: ["isFollowingCreator", creatorId],
      });
      queryClient.invalidateQueries({ queryKey: ["myFollowingCreators"] });
      queryClient.invalidateQueries({ queryKey: ["topCreators"] });
    },
  });
}

/**
 * Unfollow a creator
 */
export function useUnfollowCreator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string): Promise<void> => {
      await apiClient.delete(`/creators/${creatorId}/follow`);
    },
    onSuccess: (_, creatorId) => {
      queryClient.invalidateQueries({ queryKey: ["creators", creatorId] });
      queryClient.invalidateQueries({ queryKey: ["creatorStats", creatorId] });
      queryClient.invalidateQueries({
        queryKey: ["isFollowingCreator", creatorId],
      });
      queryClient.invalidateQueries({ queryKey: ["myFollowingCreators"] });
      queryClient.invalidateQueries({ queryKey: ["topCreators"] });
    },
  });
}

/**
 * Get stats for a creator (followers, rank, earnings, etc)
 */
export function useCreatorStats(creatorId: string) {
  return useQuery({
    queryKey: ["creatorStats", creatorId],
    queryFn: async (): Promise<CreatorStats> => {
      const res = await apiClient.get(`/creators/${creatorId}/stats`);
      return res.data;
    },
    enabled: !!creatorId,
  });
}

/**
 * Check if current user is following a creator
 */
export function useIsFollowingCreator(creatorId: string) {
  return useQuery({
    queryKey: ["isFollowingCreator", creatorId],
    queryFn: async (): Promise<{ isFollowing: boolean }> => {
      const res = await apiClient.get(`/creators/${creatorId}/is-following`);
      return res.data;
    },
    enabled: !!creatorId,
  });
}

/**
 * Get list of creators that current user is following
 */
export function useMyFollowingCreators(page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: ["myFollowingCreators", page, limit],
    queryFn: async (): Promise<{
      creators: any[]; // TODO: Import Creator type from useCreators
      total: number;
    }> => {
      const res = await apiClient.get(`/creators/me/following`, {
        params: { page, limit },
      });
      return res.data;
    },
  });
}

/**
 * Get current user's creator stats (only if user is a creator)
 */
export function useMyCreatorStats() {
  return useQuery({
    queryKey: ["myCreatorStats"],
    queryFn: async (): Promise<CreatorStats> => {
      const res = await apiClient.get(`/creators/me/stats`);
      return res.data;
    },
  });
}

/**
 * Get top-ranked creators
 */
export function useTopCreators(limit: number = 10) {
  return useQuery({
    queryKey: ["topCreators", limit],
    queryFn: async (): Promise<any[]> => {
      // TODO: Import Creator type from useCreators
      const res = await apiClient.get(`/creators/top/ranked`, {
        params: { limit },
      });
      return res.data;
    },
  });
}

/**
 * Get followers count for a creator
 */
export function useCreatorFollowersCount(creatorId: string) {
  return useQuery({
    queryKey: ["creatorFollowersCount", creatorId],
    queryFn: async (): Promise<{ count: number }> => {
      const res = await apiClient.get(`/creators/${creatorId}/followers-count`);
      return res.data;
    },
    enabled: !!creatorId,
  });
}

/**
 * Get list of followers for a creator
 */
export function useCreatorFollowers(
  creatorId: string,
  page: number = 1,
  limit: number = 20
) {
  return useQuery({
    queryKey: ["creatorFollowers", creatorId, page, limit],
    queryFn: async (): Promise<{
      followers: any[]; // TODO: Import User type
      total: number;
    }> => {
      const res = await apiClient.get(`/creators/${creatorId}/followers`, {
        params: { page, limit },
      });
      return res.data;
    },
    enabled: !!creatorId,
  });
}
