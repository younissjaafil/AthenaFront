"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type {
  Conversation,
  CreateConversationDto,
  SendMessageDto,
  SendMessageResponse,
  ConversationStatus,
} from "@/lib/types/conversation";

// Query keys
export const conversationKeys = {
  all: ["conversations"] as const,
  list: (status?: ConversationStatus) =>
    status ? ["conversations", { status }] : ["conversations"],
  detail: (id: string) => ["conversations", id] as const,
  byAgent: (agentId: string) => ["conversations", "agent", agentId] as const,
};

// Fetch user's conversations
export function useConversations(status?: ConversationStatus) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: conversationKeys.list(status),
    queryFn: async () => {
      const params = status ? `?status=${status}` : "";
      const response = await apiClient.get<Conversation[]>(
        `/api/conversations${params}`
      );
      return response.data;
    },
  });
}

// Fetch single conversation with messages
export function useConversation(conversationId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: conversationKeys.detail(conversationId),
    queryFn: async () => {
      const response = await apiClient.get<Conversation>(
        `/api/conversations/${conversationId}`
      );
      return response.data;
    },
    enabled: !!conversationId,
  });
}

// Find or create conversation with an agent
export function useFindOrCreateConversation() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: CreateConversationDto) => {
      const response = await apiClient.post<Conversation>(
        "/api/conversations",
        dto
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      queryClient.setQueryData(conversationKeys.detail(data.id), data);
    },
  });
}

// Send message and get AI response
export function useSendMessage(conversationId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dto: SendMessageDto) => {
      const response = await apiClient.post<SendMessageResponse>(
        `/api/conversations/${conversationId}/messages`,
        dto
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Update the conversation in cache with new messages
      queryClient.setQueryData<Conversation>(
        conversationKeys.detail(conversationId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messageCount: old.messageCount + 2,
            lastMessageAt: data.assistantMessage.createdAt,
            messages: [
              ...(old.messages || []),
              data.userMessage,
              data.assistantMessage,
            ],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

// Archive conversation
export function useArchiveConversation() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => {
      await apiClient.patch(`/api/conversations/${conversationId}/archive`);
      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}
