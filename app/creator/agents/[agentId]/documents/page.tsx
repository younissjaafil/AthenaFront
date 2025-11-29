"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAgent } from "@/hooks/useAgents";
import {
  useAgentDocuments,
  useUploadDocument,
  useDeleteDocument,
  useDocumentStats,
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

export default function AgentDocumentsPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  // Fetch agent and documents
  const { data: agent, isLoading: agentLoading } = useAgent(agentId);
  const {
    data: documents,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useAgentDocuments(agentId);
  const { data: stats } = useDocumentStats(agentId);

  // Mutations
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();

  // State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploadId, setRecentUploadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Poll for recent upload status
  const { data: recentDoc } = usePollDocumentStatus(
    recentUploadId,
    recentUploadId !== null
  );

  // When recent doc finishes processing, stop polling and show toast
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

  const handleFileSelect = async (file: File) => {
    setUploadProgress(0);

    // Simulate progress (actual progress would come from XHR)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      const result = await uploadDocument.mutateAsync({
        file,
        agentId,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Start polling for this document
      setRecentUploadId(result.id);

      setToast({
        message: `"${file.name}" uploaded successfully! Processing...`,
        type: "success",
      });

      // Reset progress after a moment
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

  const handleDelete = async (documentId: string) => {
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

  const isLoading = agentLoading || documentsLoading;

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

      {/* Header with Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link
            href="/creator/agents"
            className="hover:text-brand-purple-600 transition-colors"
          >
            Agents
          </Link>
          <span>/</span>
          {agent ? (
            <Link
              href={`/creator/agents/${agentId}/edit`}
              className="hover:text-brand-purple-600 transition-colors"
            >
              {agent.name}
            </Link>
          ) : (
            <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-24 inline-block" />
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-white font-medium">
            Documents
          </span>
        </nav>

        {/* Title & Description */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Knowledge Base
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Upload documents to train{" "}
              <span className="text-brand-purple-600 dark:text-brand-purple-400 font-medium">
                {agent?.name || "your agent"}
              </span>{" "}
              with your knowledge
            </p>
          </div>

          {/* Stats */}
          {stats && (
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
          )}
        </div>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={uploadDocument.isPending}
          uploadProgress={uploadProgress}
          disabled={uploadDocument.isPending}
        />
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Uploaded Documents
          </h2>
          {documents && documents.length > 0 && (
            <Badge variant="default">
              {documents.length} document{documents.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <DocumentCardSkeleton key={i} />
            ))}
          </div>
        ) : documents && documents.length > 0 ? (
          <StaggerContainer className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {documents.map((doc) => (
                <StaggerItem key={doc.id} hoverEffect={false}>
                  <DocumentCard
                    document={doc}
                    onDelete={handleDelete}
                    isDeleting={deletingId === doc.id}
                  />
                </StaggerItem>
              ))}
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
              No documents yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
              Upload PDFs, Word docs, or text files to give your agent knowledge
              about specific topics.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* RAG Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
              How RAG Works
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              When you upload a document, we split it into chunks, generate
              embeddings, and store them in a vector database. When users ask
              questions, we find the most relevant chunks and include them in
              the context for your agent.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="primary" size="sm">
                Chunking
              </Badge>
              <Badge variant="teal" size="sm">
                Embeddings
              </Badge>
              <Badge variant="info" size="sm">
                Vector Search
              </Badge>
              <Badge variant="success" size="sm">
                Context Injection
              </Badge>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
