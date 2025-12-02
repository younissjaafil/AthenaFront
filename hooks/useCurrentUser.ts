"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";

/**
 * User roles - stored as array in backend
 * Everyone has 'user', creators add 'creator', admins add 'admin'
 */
export type UserRole = "user" | "creator" | "admin";

/**
 * User information from AthenaCore backend
 */
export interface CurrentUser {
  // User info from /users/me
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;

  // Roles array from backend
  roles: UserRole[];

  // Computed role flags
  isCreator: boolean;
  isAdmin: boolean;

  // Status
  isActive: boolean;

  // Creator profile ID (if isCreator)
  creatorId?: string;
}

/**
 * Hook to get current user information from AthenaCore backend.
 * Simple: get user, check if creator profile exists.
 */
export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<CurrentUser> => {
      const apiClient = createClientApiClient(getToken);

      // 1. Get user info
      const userResponse = await apiClient.get("/api/users/me");
      const user = userResponse.data;

      // 2. Check if creator profile exists
      let creatorId: string | undefined;
      try {
        const creatorResponse = await apiClient.get("/api/creators/me");
        // Backend returns null if no creator profile
        creatorId = creatorResponse.data?.id;
      } catch (error: any) {
        // 404 = not a creator, which is fine
        if (error.response?.status !== 404) {
          console.error("Error checking creator status:", error);
        }
      }

      // Roles from backend
      const roles: UserRole[] = user.roles || ["user"];
      const isCreator = roles.includes("creator");
      const isAdmin = roles.includes("admin");

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        roles,
        isCreator,
        isAdmin,
        isActive: user.isActive !== false,
        creatorId,
      };
    },
    enabled: isSignedIn === true,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Hook to enable creator power (become a creator)
 */
export function useEnableCreatorPower() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorData: {
      title: string;
      bio?: string;
      expertiseLevel?: "beginner" | "intermediate" | "expert";
      specialties?: string[];
    }) => {
      const apiClient = createClientApiClient(getToken);
      const response = await apiClient.post("/api/creators", creatorData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/**
 * Hook to disable creator power
 */
export function useDisableCreatorPower() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const apiClient = createClientApiClient(getToken);
      const response = await apiClient.delete("/api/creators/me/power");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
