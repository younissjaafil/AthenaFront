"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type { Document, DocumentStats } from "@/lib/types/document";

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  byAgent: (agentId: string) => ["documents", "agent", agentId] as const,
  detail: (id: string) => ["documents", id] as const,
  stats: (agentId: string) => ["documents", "stats", agentId] as const,
  myDocuments: ["documents", "my-documents"] as const,
};

// Fetch documents for an agent
export function useAgentDocuments(agentId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.byAgent(agentId),
    queryFn: async () => {
      const response = await apiClient.get<Document[]>(
        `/api/documents/agent/${agentId}`
      );
      return response.data;
    },
    enabled: !!agentId,
  });
}

// Fetch single document by ID
export function useDocument(documentId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.detail(documentId),
    queryFn: async () => {
      const response = await apiClient.get<Document>(
        `/api/documents/${documentId}`
      );
      return response.data;
    },
    enabled: !!documentId,
  });
}

// Fetch document stats for an agent
export function useDocumentStats(agentId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.stats(agentId),
    queryFn: async () => {
      const response = await apiClient.get<DocumentStats>(
        `/api/documents/agent/${agentId}/stats`
      );
      return response.data;
    },
    enabled: !!agentId,
  });
}

// Fetch my documents
export function useMyDocuments() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.myDocuments,
    queryFn: async () => {
      const response = await apiClient.get<Document[]>("/api/documents/me");
      return response.data;
    },
  });
}

// Upload document mutation
export function useUploadDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      agentId,
      title,
      description,
      onProgress,
    }: {
      file: File;
      agentId: string;
      title?: string;
      description?: string;
      onProgress?: (progress: number) => void;
    }) => {
      const token = await getToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("agentId", agentId);
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ATHENA_CORE_URL}/api/documents/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Upload failed");
      }

      return response.json() as Promise<Document>;
    },
    onSuccess: (newDocument) => {
      // Invalidate documents list for the agent
      queryClient.invalidateQueries({
        queryKey: documentKeys.byAgent(newDocument.agentId),
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.stats(newDocument.agentId),
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.myDocuments,
      });
    },
  });
}

// Delete document mutation
export function useDeleteDocument() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      agentId,
    }: {
      documentId: string;
      agentId: string;
    }) => {
      await apiClient.delete(`/api/documents/${documentId}`);
      return { documentId, agentId };
    },
    onSuccess: ({ documentId, agentId }) => {
      // Remove from cache
      queryClient.invalidateQueries({
        queryKey: documentKeys.byAgent(agentId),
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.stats(agentId),
      });
      queryClient.removeQueries({
        queryKey: documentKeys.detail(documentId),
      });
    },
  });
}

// Poll document status until processing is complete
export function usePollDocumentStatus(
  documentId: string | null,
  enabled: boolean = true
) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.detail(documentId || ""),
    queryFn: async () => {
      const response = await apiClient.get<Document>(
        `/api/documents/${documentId}`
      );
      return response.data;
    },
    enabled: !!documentId && enabled,
    refetchInterval: (query) => {
      const data = query.state.data as Document | undefined;
      // Keep polling if status is uploading or processing
      if (data?.status === "uploading" || data?.status === "processing") {
        return 2000; // Poll every 2 seconds
      }
      return false; // Stop polling when complete or failed
    },
  });
}
