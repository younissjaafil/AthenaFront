"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;

  // Role from backend
  role: "student" | "creator" | "admin";

  // Role flags (derived from backend responses)
  isAdmin: boolean;
  isCreator: boolean;
  isStudent: boolean;

  // Onboarding/Intent flags
  hasCompletedOnboarding: boolean;
  isLearner: boolean;
  isCreatorIntent: boolean;
  hasCompletedDiscovery: boolean;
  intentSelectedAt?: string;
  lastActivityContext?: string;

  // Creator info (if isCreator is true)
  creatorId?: string;

  // Computed: needs to select intent
  needsIntentSelection: boolean;
  // Computed: needs discovery (learners who haven't explored)
  needsDiscovery: boolean;
  // Computed: needs creator onboarding
  needsCreatorOnboarding: boolean;
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
      const userResponse = await apiClient.get("/api/users/me");
      const user = userResponse.data;

      // 2. Check if user is a creator (404 = not a creator)
      let isCreator = false;
      let creatorId: string | undefined;
      try {
        const creatorResponse = await apiClient.get("/api/creators/me");
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

      // Determine role string
      let role: "student" | "creator" | "admin" = "student";
      if (isAdmin) role = "admin";
      else if (isCreator) role = "creator";

      // 4. Compute onboarding state
      const needsIntentSelection = !user.intentSelectedAt;
      const needsDiscovery =
        user.isLearner && !user.hasCompletedDiscovery && !isCreator;
      const needsCreatorOnboarding =
        user.isCreatorIntent && !isCreator && !user.hasCompletedOnboarding;

      return {
        id: user.id,
        clerkUserId: user.clerkUserId,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        role,
        isAdmin,
        isCreator,
        isStudent,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        isLearner: user.isLearner,
        isCreatorIntent: user.isCreatorIntent,
        hasCompletedDiscovery: user.hasCompletedDiscovery,
        intentSelectedAt: user.intentSelectedAt,
        lastActivityContext: user.lastActivityContext,
        creatorId,
        needsIntentSelection,
        needsDiscovery,
        needsCreatorOnboarding,
      };
    },
    enabled: isSignedIn === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

/**
 * Hook to set user intent (learn vs earn)
 */
export function useSetIntent() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (intent: "learn" | "earn") => {
      const apiClient = createClientApiClient(getToken);
      const response = await apiClient.post("/api/users/me/intent", { intent });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}

/**
 * Hook to mark discovery as completed
 */
export function useCompleteDiscovery() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const apiClient = createClientApiClient(getToken);
      const response = await apiClient.post("/api/users/me/complete-discovery");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
}
