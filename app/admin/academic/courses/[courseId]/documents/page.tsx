"use client";

import { useState, useEffect, useMemo, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  Eye,
  EyeOff,
  Bot,
  BookOpen,
  CheckCircle,
  Clock,
  XCircle,
  ExternalLink,
  Database,
  FileImage,
  X,
} from "lucide-react";
import { useCourse, useCourseJarvis } from "@/hooks/useAcademic";
import {
  useAgentDocuments,
  useUploadDocument,
  useDeleteDocument,
  useUpdateDocument,
  usePollDocumentStatus,
} from "@/hooks/useDocuments";
import { FileUpload } from "@/components/ui/file-upload";
import { DocumentStatus, formatFileSize } from "@/lib/types/document";
import { SecurePdfViewer } from "@/components/documents/SecurePdfViewer";

export default function CourseDocumentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();

  // Fetch course and Jarvis info
  const { data: course, isLoading: courseLoading } = useCourse(courseId);
  const { data: jarvisInfo, isLoading: jarvisLoading } =
    useCourseJarvis(courseId);

  // Get agent ID from Jarvis info
  const agentId = jarvisInfo?.agentId || "";

  // Fetch documents for this agent
  const {
    data: documents,
    isLoading: documentsLoading,
    refetch: refetchDocuments,
  } = useAgentDocuments(agentId);

  // Mutations
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const updateDocument = useUpdateDocument();

  // State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [recentUploadId, setRecentUploadId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    id: string;
    title: string;
  } | null>(null);

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

  // Calculate stats
  const stats = useMemo(() => {
    const docs = documents || [];
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
  }, [documents]);

  const handleFileSelect = async (file: File) => {
    if (!agentId) {
      setToast({
        message: "No agent found for this course. Create Jarvis first.",
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
        agentId,
        visibility: "PUBLIC",
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

  const handleDelete = async (documentId: string) => {
    if (
      !confirm("Delete this document? This will also remove all embeddings.")
    ) {
      return;
    }

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

  const handleToggleVisibility = async (
    documentId: string,
    newVisibility: "PUBLIC" | "PRIVATE"
  ) => {
    setUpdatingId(documentId);
    try {
      await updateDocument.mutateAsync({
        documentId,
        visibility: newVisibility,
      });
      setToast({
        message: `Document is now ${
          newVisibility === "PUBLIC" ? "public" : "private"
        }`,
        type: "success",
      });
    } catch (error: any) {
      setToast({
        message: error.message || "Failed to update visibility",
        type: "error",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case DocumentStatus.PROCESSED:
      case "PROCESSED":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case DocumentStatus.PROCESSING:
      case "PROCESSING":
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case DocumentStatus.FAILED:
      case "FAILED":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const isLoading = courseLoading || jarvisLoading;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Course not found
          </h2>
          <button
            onClick={() => router.back()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!jarvisInfo || !agentId) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Bot className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            No Jarvis for this course
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create a Course Jarvis first to manage documents.
          </p>
          <button
            onClick={() => router.push("/admin/academic")}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Academic Management
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : "bg-red-500 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/academic")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {course.code}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {course.title} - Documents
          </h1>
        </div>
        <Link
          href={jarvisInfo.profileUrl || "#"}
          target="_blank"
          className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50"
        >
          <Bot className="w-4 h-4" />
          View Jarvis Profile
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <FileText className="w-4 h-4" />
            Documents
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.totalDocuments}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            <Database className="w-4 h-4" />
            Chunks
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.totalChunks}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-green-500 text-sm">
            <CheckCircle className="w-4 h-4" />
            Processed
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {stats.processed}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
            Total Size
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            {formatFileSize(stats.totalSize)}
          </p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          Upload Course Materials
        </h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={uploadDocument.isPending}
          uploadProgress={uploadProgress}
          accept=".pdf,.doc,.docx,.txt,.md"
          maxSize={50 * 1024 * 1024} // 50MB
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Supported formats: PDF, DOC, DOCX, TXT, MD. Max size: 50MB
        </p>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Uploaded Documents ({documents?.length || 0})
          </h2>
        </div>

        {documentsLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : documents?.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No documents uploaded yet. Upload course materials to train the
              Jarvis assistant.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {documents?.map((doc) => (
              <div
                key={doc.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white truncate">
                        {doc.originalFilename}
                      </span>
                      {getStatusIcon(doc.status)}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span>{formatFileSize(doc.fileSize || 0)}</span>
                      {doc.chunkCount !== undefined && (
                        <span>{doc.chunkCount} chunks</span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          doc.visibility === "PUBLIC"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {doc.visibility}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.fileType === "application/pdf" && (
                    <button
                      onClick={() =>
                        setPreviewDoc({
                          id: doc.id,
                          title: doc.originalFilename,
                        })
                      }
                      className="p-2 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      title="Preview PDF"
                    >
                      <FileImage className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() =>
                      handleToggleVisibility(
                        doc.id,
                        doc.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"
                      )
                    }
                    disabled={updatingId === doc.id}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                    title={
                      doc.visibility === "PUBLIC"
                        ? "Make Private"
                        : "Make Public"
                    }
                  >
                    {doc.visibility === "PUBLIC" ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <AnimatePresence>
        {previewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setPreviewDoc(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <SecurePdfViewer
                documentId={previewDoc.id}
                title={previewDoc.title}
                onClose={() => setPreviewDoc(null)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
