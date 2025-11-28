"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";

/**
 * User role and profile information from AthenaCore backend
 */
export interface CurrentUser {
  // User info from /users/me
  id: string;
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;

  // Role flags (derived from backend responses)
  isAdmin: boolean;
  isCreator: boolean;
  isStudent: boolean;

  // Creator info (if isCreator is true)
  creatorId?: string;
}

/**
 * Hook to get current user information and roles from AthenaCore backend.
 *
 * Calls:
 * 1. GET /users/me (required - contains isAdmin flag)
 * 2. GET /creators/me (optional - 404 means not a creator)
 * 3. Derives isStudent = !isAdmin && !isCreator
 *
 * @returns React Query result with CurrentUser data
 */
export function useCurrentUser() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async (): Promise<CurrentUser> => {
      const apiClient = createClientApiClient(getToken);

      // 1. Get user info (required)
      const userResponse = await apiClient.get("/users/me");
      const user = userResponse.data;

      // 2. Check if user is a creator (404 = not a creator)
      let isCreator = false;
      let creatorId: string | undefined;
      try {
        const creatorResponse = await apiClient.get("/creators/me");
        isCreator = true;
        creatorId = creatorResponse.data.id;
      } catch (error: any) {
        // 404 is expected if user is not a creator
        if (error.response?.status !== 404) {
          console.error("Error checking creator status:", error);
        }
      }

      // 3. Derive roles
      const isAdmin = user.isAdmin === true;
      const isStudent = !isAdmin && !isCreator;

      return {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin,
        isCreator,
        isStudent,
        creatorId,
      };
    },
    enabled: isSignedIn === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
