"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";
import type {
  Document,
  DocumentStats,
  UnifiedUploadDocumentDto,
  PublicDocument,
} from "@/lib/types/document";

// Query keys
export const documentKeys = {
  all: ["documents"] as const,
  byAgent: (agentId: string) => ["documents", "agent", agentId] as const,
  byCreator: (creatorId: string) =>
    ["documents", "creator", creatorId] as const,
  byCreatorProfile: (creatorId: string) =>
    ["documents", "creator", creatorId, "profile"] as const,
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
        `/documents/agent/${agentId}`
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
        `/documents/agent/${agentId}/stats`
      );
      return response.data;
    },
    enabled: !!agentId,
  });
}

// Fetch my documents (from all my agents)
export function useMyDocuments() {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.myDocuments,
    queryFn: async () => {
      const response = await apiClient.get<Document[]>(
        "/documents/my-documents"
      );
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
      visibility,
      onProgress,
    }: {
      file: File;
      agentId: string;
      title?: string;
      description?: string;
      visibility?: "PUBLIC" | "PRIVATE";
      onProgress?: (progress: number) => void;
    }) => {
      const token = await getToken();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("agentId", agentId);
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (visibility) formData.append("visibility", visibility);

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
      if (newDocument.agentId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byAgent(newDocument.agentId),
        });
        queryClient.invalidateQueries({
          queryKey: documentKeys.stats(newDocument.agentId),
        });
      }
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
      creatorId,
    }: {
      documentId: string;
      agentId?: string;
      creatorId?: string;
    }) => {
      await apiClient.delete(`/documents/${documentId}`);
      return { documentId, agentId, creatorId };
    },
    onSuccess: ({ documentId, agentId, creatorId }) => {
      // Remove from cache
      if (agentId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byAgent(agentId),
        });
        queryClient.invalidateQueries({
          queryKey: documentKeys.stats(agentId),
        });
      }
      if (creatorId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byCreator(creatorId),
        });
        queryClient.invalidateQueries({
          queryKey: documentKeys.byCreatorProfile(creatorId),
        });
      }
      queryClient.removeQueries({
        queryKey: documentKeys.detail(documentId),
      });
      // Also invalidate my-documents list
      queryClient.invalidateQueries({
        queryKey: documentKeys.myDocuments,
      });
    },
  });
}

// Update document mutation (visibility, title, description)
export function useUpdateDocument() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      documentId,
      visibility,
      title,
      description,
    }: {
      documentId: string;
      visibility?: "PUBLIC" | "PRIVATE" | "FOLLOWERS" | "SUBSCRIBERS";
      title?: string;
      description?: string;
    }) => {
      const apiClient = createClientApiClient(getToken);
      const response = await apiClient.patch<Document>(
        `/documents/${documentId}`,
        { visibility, title, description }
      );
      return response.data;
    },
    onSuccess: (updatedDoc) => {
      // Invalidate relevant queries
      if (updatedDoc.agentId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byAgent(updatedDoc.agentId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: documentKeys.myDocuments,
      });
      queryClient.invalidateQueries({
        queryKey: documentKeys.detail(updatedDoc.id),
      });
      // Also invalidate profile documents if visibility changed
      if (updatedDoc.ownerId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byCreatorProfile(updatedDoc.ownerId),
        });
      }
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
        `/documents/${documentId}`
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

// ===== UNIFIED DOCUMENT SYSTEM =====

// Unified upload document mutation
export function useUploadUnified() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      uploadDto,
      onProgress,
    }: {
      file: File;
      uploadDto: UnifiedUploadDocumentDto;
      onProgress?: (progress: number) => void;
    }) => {
      const token = await getToken();

      const formData = new FormData();
      formData.append("file", file);
      // Add all DTO fields
      Object.entries(uploadDto).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_ATHENA_CORE_URL}/api/documents/upload-unified`,
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
      // Invalidate relevant queries
      if (newDocument.agentId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byAgent(newDocument.agentId),
        });
        queryClient.invalidateQueries({
          queryKey: documentKeys.stats(newDocument.agentId),
        });
      }
      if (newDocument.ownerId) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.byCreator(newDocument.ownerId),
        });
        queryClient.invalidateQueries({
          queryKey: documentKeys.byCreatorProfile(newDocument.ownerId),
        });
      }
      queryClient.invalidateQueries({
        queryKey: documentKeys.myDocuments,
      });
    },
  });
}

// Fetch public profile documents for a creator
export function useCreatorProfileDocuments(creatorId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.byCreatorProfile(creatorId),
    queryFn: async () => {
      const response = await apiClient.get<PublicDocument[]>(
        `/documents/creator/${creatorId}/profile`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}

// Fetch all documents for a creator (private - own documents only)
export function useCreatorAllDocuments(creatorId: string) {
  const { getToken } = useAuth();
  const apiClient = createClientApiClient(getToken);

  return useQuery({
    queryKey: documentKeys.byCreator(creatorId),
    queryFn: async () => {
      const response = await apiClient.get<Document[]>(
        `/documents/creator/${creatorId}/all`
      );
      return response.data;
    },
    enabled: !!creatorId,
  });
}
