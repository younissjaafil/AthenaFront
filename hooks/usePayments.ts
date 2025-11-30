"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type {
  Transaction,
  Entitlement,
  CreatePaymentDto,
  AgentAccessResponse,
} from "@/lib/types/payment";

// Query keys
export const paymentKeys = {
  all: ["payments"] as const,
  transactions: ["payments", "transactions"] as const,
  entitlements: ["payments", "entitlements"] as const,
  agentAccess: (agentId: string) => ["payments", "access", agentId] as const,
  transactionStatus: (id: string) => ["payments", "transaction", id] as const,
};

// Get user's transactions history
export function useTransactions() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: paymentKeys.transactions,
    queryFn: async () => {
      const response = await apiClient.get<Transaction[]>(
        "/api/payments/transactions"
      );
      return response.data;
    },
  });
}

// Get user's entitlements
export function useEntitlements() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: paymentKeys.entitlements,
    queryFn: async () => {
      const response = await apiClient.get<Entitlement[]>(
        "/api/payments/entitlements"
      );
      return response.data;
    },
  });
}

// Check if user has access to specific agent
export function useAgentAccess(agentId: string) {
  const { getToken, isSignedIn } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: paymentKeys.agentAccess(agentId),
    queryFn: async () => {
      const response = await apiClient.get<AgentAccessResponse>(
        `/api/payments/agent/${agentId}/access`
      );
      return response.data;
    },
    enabled: !!agentId && isSignedIn,
  });
}

// Get transaction status
export function useTransactionStatus(transactionId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: paymentKeys.transactionStatus(transactionId),
    queryFn: async () => {
      const response = await apiClient.get<Transaction>(
        `/api/payments/transactions/${transactionId}/status`
      );
      return response.data;
    },
    enabled: !!transactionId,
    refetchInterval: (data) => {
      // Keep polling while pending
      if (data?.state?.data?.status === "pending") {
        return 3000; // Poll every 3 seconds
      }
      return false;
    },
  });
}

// Create payment for agent access
export function useCreatePayment() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      agentId,
      data,
    }: {
      agentId: string;
      data: CreatePaymentDto;
    }) => {
      const response = await apiClient.post<Transaction>(
        `/api/payments/agent/${agentId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.transactions });
    },
  });
}

// Hook to check and return combined access info
export function useAgentAccessInfo(agentId: string, isFree: boolean) {
  const { isSignedIn } = useAuth();
  const { data: accessData, isLoading } = useAgentAccess(agentId);

  // Free agents always have access
  if (isFree) {
    return {
      hasAccess: true,
      isLoading: false,
      needsPayment: false,
    };
  }

  // Not signed in - no access
  if (!isSignedIn) {
    return {
      hasAccess: false,
      isLoading: false,
      needsPayment: true,
      requiresSignIn: true,
    };
  }

  // If access check says it's free, grant access
  if (accessData?.isFree) {
    return {
      hasAccess: true,
      isLoading: false,
      needsPayment: false,
    };
  }

  return {
    hasAccess: accessData?.hasAccess ?? false,
    isLoading,
    needsPayment: !accessData?.hasAccess,
    requiresSignIn: false,
    pricePerMessage: accessData?.pricePerMessage,
    pricePerConversation: accessData?.pricePerConversation,
  };
}
