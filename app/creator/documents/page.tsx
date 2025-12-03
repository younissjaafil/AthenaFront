"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useMyAgents } from "@/hooks/useAgents";
import {
  useMyDocuments,
  useUploadDocument,
  useDeleteDocument,
  usePollDocumentStatus,
} from "@/hooks/useDocuments";
import { FileUpload } from "@/components/ui/file-upload";
import {
  DocumentCard,
  DocumentCardSkeleton,
} from "@/components/ui/document-card";
import { StaggerContainer, StaggerItem } from "@/components/ui/animated-card";
import { Badge } from "@/components/ui/badge";
import { DocumentStatus, formatFileSize } from "@/lib/types/document";
import type { Agent } from "@/lib/types/agent";

export default function CreatorDocumentsPage() {
  // Data fetching
  const { data: agents, isLoading: agentsLoading } = useMyAgents();
  const {
    data: documents,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useMyDocuments();

  // Mutations
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  // State
  const [selectedAgentId, setSelectedAgentId] = useState<string>("all");
  const [uploadAgentId, setUploadAgentId] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploadId, setRecentUploadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Set default upload agent when agents load
  useEffect(() => {
    if (agents && agents.length > 0 && !uploadAgentId) {
      setUploadAgentId(agents[0].id);
    }
  }, [agents, uploadAgentId]);

  // Poll for recent upload status
  const { data: recentDoc } = usePollDocumentStatus(
    recentUploadId,
    recentUploadId !== null
  );

  // When recent doc finishes processing
  useEffect(() => {
    if (recentDoc?.status === DocumentStatus.PROCESSED) {
      setRecentUploadId(null);
      refetchDocuments();
      setToast({
        message: `"${recentDoc.originalFilename}" processed successfully! ${recentDoc.chunkCount} chunks created.`,
        type: "success",
      });
    } else if (recentDoc?.status === DocumentStatus.FAILED) {
      setRecentUploadId(null);
      refetchDocuments();
      setToast({
        message: `Failed to process "${recentDoc.originalFilename}": ${
          recentDoc.errorMessage || "Unknown error"
        }`,
        type: "error",
      });
    }
  }, [
    recentDoc?.status,
    recentDoc?.originalFilename,
    recentDoc?.chunkCount,
    recentDoc?.errorMessage,
    refetchDocuments,
  ]);

  // Auto-hide toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Filter documents by selected agent
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (selectedAgentId === "all") return documents;
    return documents.filter((doc) => doc.agentId === selectedAgentId);
  }, [documents, selectedAgentId]);

  // Calculate stats
  const stats = useMemo(() => {
    const docs = filteredDocuments;
    return {
      totalDocuments: docs.length,
      totalChunks: docs.reduce((sum, d) => sum + (d.chunkCount || 0), 0),
      totalSize: docs.reduce((sum, d) => sum + (d.fileSize || 0), 0),
      processed: docs.filter((d) => d.status === DocumentStatus.PROCESSED)
        .length,
      processing: docs.filter((d) => d.status === DocumentStatus.PROCESSING)
        .length,
      failed: docs.filter((d) => d.status === DocumentStatus.FAILED).length,
    };
  }, [filteredDocuments]);

  const handleFileSelect = async (file: File) => {
    if (!uploadAgentId) {
      setToast({
        message: "Please select an agent first",
        type: "error",
      });
      return;
    }

    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await uploadDocument.mutateAsync({
        file,
        agentId: uploadAgentId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Start polling
      setRecentUploadId(result.id);

      setToast({
        message: `"${file.name}" uploaded successfully! Processing...`,
        type: "success",
      });

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error: any) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setToast({
        message: error.message || "Failed to upload document",
        type: "error",
      });
    }
  };

  const handleDelete = async (documentId: string, agentId: string) => {
    setDeletingId(documentId);
    try {
      await deleteDocument.mutateAsync({ documentId, agentId });
      setToast({
        message: "Document deleted successfully",
        type: "success",
      });
    } catch (error: any) {
      setToast({
        message: error.message || "Failed to delete document",
        type: "error",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = agentsLoading || documentsLoading;
  const hasAgents = agents && agents.length > 0;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-50"
          >
            <div
              className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span>{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 p-1 hover:bg-white/20 rounded"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              My Documents
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage training documents across all your agents
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-purple-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {stats.totalDocuments} docs
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-teal-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {stats.totalChunks} chunks
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-gray-600 dark:text-gray-300">
                {formatFileSize(stats.totalSize)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Section */}
      {hasAgents ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Agent Selection for Upload */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload to agent:
            </label>
            <select
              value={uploadAgentId}
              onChange={(e) => setUploadAgentId(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-purple-500 focus:border-transparent"
            >
              {agents?.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <FileUpload
            onFileSelect={handleFileSelect}
            isUploading={uploadDocument.isPending}
            uploadProgress={uploadProgress}
            disabled={uploadDocument.isPending || !uploadAgentId}
          />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-yellow-100 dark:bg-yellow-900/50 flex items-center justify-center mb-3">
            <span className="text-2xl">🤖</span>
          </div>
          <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
            Create an Agent First
          </h3>
          <p className="text-yellow-600 dark:text-yellow-400 mt-1 text-sm">
            You need at least one agent before you can upload documents.
          </p>
          <Link
            href="/creator/agents/new"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-purple-600 hover:bg-brand-purple-700 text-white rounded-lg transition-colors"
          >
            <span>+</span>
            Create Your First Agent
          </Link>
        </motion.div>
      )}

      {/* Filter by Agent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          All Documents
        </h2>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 dark:text-gray-400">
            Filter by agent:
          </label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-purple-500 focus:border-transparent"
          >
            <option value="all">All Agents</option>
            {agents?.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Status Summary */}
      {filteredDocuments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2"
        >
          {stats.processed > 0 && (
            <Badge variant="success">✓ {stats.processed} processed</Badge>
          )}
          {stats.processing > 0 && (
            <Badge variant="info">⟳ {stats.processing} processing</Badge>
          )}
          {stats.failed > 0 && (
            <Badge variant="danger">✕ {stats.failed} failed</Badge>
          )}
        </motion.div>
      )}

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredDocuments.length > 0 ? (
          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredDocuments.map((doc) => {
                // Find agent name for this document
                const agent = agents?.find((a) => a.id === doc.agentId);
                return (
                  <StaggerItem key={doc.id} hoverEffect={false}>
                    <div className="relative">
                      {/* Agent label */}
                      {selectedAgentId === "all" && agent && (
                        <div className="absolute -top-2 left-3 z-10">
                          <span className="text-xs bg-brand-purple-100 dark:bg-brand-purple-900/50 text-brand-purple-700 dark:text-brand-purple-300 px-2 py-0.5 rounded-full">
                            {agent.name}
                          </span>
                        </div>
                      )}
                      <DocumentCard
                        document={doc}
                        onDelete={(id) =>
                          handleDelete(id, doc.agentId || uploadAgentId)
                        }
                        isDeleting={deletingId === doc.id}
                      />
                    </div>
                  </StaggerItem>
                );
              })}
            </AnimatePresence>
          </StaggerContainer>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedAgentId === "all"
                ? "No documents yet"
                : "No documents for this agent"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              {hasAgents
                ? "Upload PDFs, Word docs, or text files to give your agents knowledge about specific topics."
                : "Create an agent first, then upload documents to train it."}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Links */}
      {hasAgents && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4"
        >
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Links
          </h3>
          <div className="flex flex-wrap gap-2">
            {agents?.slice(0, 5).map((agent) => (
              <Link
                key={agent.id}
                href={`/creator/agents/${agent.id}/documents`}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:border-brand-purple-500 hover:text-brand-purple-600 transition-colors"
              >
                <span className="text-lg">🤖</span>
                {agent.name}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Help Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-brand-purple-50 to-brand-teal-50 dark:from-brand-purple-950/30 dark:to-brand-teal-950/30 rounded-xl p-6 border border-brand-purple-100 dark:border-brand-purple-900/30"
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-brand-purple-100 dark:bg-brand-purple-900/50 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-brand-purple-600 dark:text-brand-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              How Documents Work
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              When you upload a document, it gets processed into chunks and
              converted into embeddings. Your agent can then use this knowledge
              to answer questions accurately based on your content.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Supported: PDF, DOCX, TXT, MD, HTML, CSV, JSON
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Max size: 50MB per file
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
