"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type { Agent, CreateAgentDto, UpdateAgentDto } from "@/lib/types/agent";

// Query keys
export const agentKeys = {
  all: ["agents"] as const,
  myAgents: ["agents", "my-agents"] as const,
  detail: (id: string) => ["agents", id] as const,
};

// Fetch my agents (for creators)
export function useMyAgents() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: agentKeys.myAgents,
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>("/api/agents/my-agents");
      return response.data;
    },
  });
}

// Fetch single agent by ID
export function useAgent(agentId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: agentKeys.detail(agentId),
    queryFn: async () => {
      const response = await apiClient.get<Agent>(`/api/agents/${agentId}`);
      return response.data;
    },
    enabled: !!agentId,
  });
}

// Create new agent
export function useCreateAgent() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAgentDto) => {
      const response = await apiClient.post<Agent>("/api/agents", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch my agents
      queryClient.invalidateQueries({ queryKey: agentKeys.myAgents });
    },
  });
}

// Update agent
export function useUpdateAgent() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAgentDto }) => {
      const response = await apiClient.patch<Agent>(`/api/agents/${id}`, data);
      return response.data;
    },
    onSuccess: (updatedAgent) => {
      // Update cache for both list and detail
      queryClient.invalidateQueries({ queryKey: agentKeys.myAgents });
      queryClient.setQueryData(agentKeys.detail(updatedAgent.id), updatedAgent);
    },
  });
}

// Delete agent
export function useDeleteAgent() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agentId: string) => {
      await apiClient.delete(`/api/agents/${agentId}`);
      return agentId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: agentKeys.myAgents });
      queryClient.removeQueries({ queryKey: agentKeys.detail(deletedId) });
    },
  });
}
