"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type { Agent, CreateAgentDto, UpdateAgentDto } from "@/lib/types/agent";
import type { PublicAgent } from "@/lib/types/conversation";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_ATHENA_CORE_URL;

// Query keys
export const agentKeys = {
  all: ["agents"] as const,
  public: ["agents", "public"] as const,
  free: ["agents", "free"] as const,
  myAgents: ["agents", "my-agents"] as const,
  detail: (id: string) => ["agents", id] as const,
  category: (category: string) => ["agents", "category", category] as const,
};

// Fetch public agents (no auth required)
export function usePublicAgents() {
  return useQuery({
    queryKey: agentKeys.public,
    queryFn: async () => {
      const response = await axios.get<PublicAgent[]>(`${API_URL}/api/agents`);
      return response.data;
    },
  });
}

// Fetch free agents (no auth required)
export function useFreeAgents() {
  return useQuery({
    queryKey: agentKeys.free,
    queryFn: async () => {
      const response = await axios.get<PublicAgent[]>(
        `${API_URL}/api/agents/free`
      );
      return response.data;
    },
  });
}

// Fetch agents by category (no auth required)
export function useAgentsByCategory(category: string) {
  return useQuery({
    queryKey: agentKeys.category(category),
    queryFn: async () => {
      const response = await axios.get<PublicAgent[]>(
        `${API_URL}/api/agents/category/${encodeURIComponent(category)}`
      );
      return response.data;
    },
    enabled: !!category,
  });
}

// Fetch agents by creator (no auth required)
export function useCreatorAgents(creatorId: string) {
  return useQuery({
    queryKey: ["agents", "creator", creatorId] as const,
    queryFn: async () => {
      const response = await axios.get<PublicAgent[]>(
        `${API_URL}/api/creators/${creatorId}/agents`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Alias for useCreatorAgents (used in some components)
export function useAgentsByCreator(creatorId: string) {
  return useCreatorAgents(creatorId);
}

// Fetch all agents (admin - includes private)
export function useAllAgents() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: agentKeys.all,
    queryFn: async () => {
      // For admin, fetch all public agents (we can enhance this later with admin endpoint)
      const response = await apiClient.get<PublicAgent[]>("/agents");
      return response.data;
    },
  });
}

// Fetch my agents (for creators)
export function useMyAgents() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: agentKeys.myAgents,
    queryFn: async () => {
      const response = await apiClient.get<Agent[]>("/agents/my-agents");
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
      const response = await apiClient.get<Agent>(`/agents/${agentId}`);
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
      const response = await apiClient.post<Agent>("/agents", data);
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
      const response = await apiClient.patch<Agent>(`/agents/${id}`, data);
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
      await apiClient.delete(`/agents/${agentId}`);
      return agentId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.invalidateQueries({ queryKey: agentKeys.myAgents });
      queryClient.invalidateQueries({ queryKey: agentKeys.all });
      queryClient.removeQueries({ queryKey: agentKeys.detail(deletedId) });
    },
  });
}

// Composite hook that returns all agent hooks
export function useAgents() {
  return {
    useAllAgents,
    usePublicAgents,
    useFreeAgents,
    useMyAgents,
    useAgent,
    useAgentsByCategory,
    useAgentsByCreator,
    useCreatorAgents,
    useCreateAgent,
    useUpdateAgent,
    useDeleteAgent,
  };
}
