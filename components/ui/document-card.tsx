"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Document,
  DocumentStatus,
  FILE_TYPE_ICONS,
  formatFileSize,
  getStatusColor,
} from "@/lib/types/document";

interface DocumentCardProps {
  document: Document;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}

export function DocumentCard({
  document,
  onDelete,
  isDeleting,
}: DocumentCardProps) {
  const statusConfig: Record<
    DocumentStatus,
    { label: string; variant: "success" | "info" | "warning" | "danger" }
  > = {
    [DocumentStatus.COMPLETED]: { label: "Processed", variant: "success" },
    [DocumentStatus.PROCESSING]: { label: "Processing", variant: "info" },
    [DocumentStatus.UPLOADING]: { label: "Uploading", variant: "warning" },
    [DocumentStatus.FAILED]: { label: "Failed", variant: "danger" },
  };

  const { label, variant } = statusConfig[document.status] || {
    label: document.status,
    variant: "default" as const,
  };

  const icon = FILE_TYPE_ICONS[document.type] || "📄";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="group relative bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 transition-shadow hover:shadow-lg hover:shadow-brand-purple-500/10"
    >
      {/* Processing Animation */}
      {document.status === DocumentStatus.PROCESSING && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-brand-purple-500 to-brand-teal-500"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* File Icon */}
        <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl flex-shrink-0">
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-gray-900 dark:text-white truncate">
              {document.originalName}
            </h3>
            <Badge variant={variant} size="sm">
              {label}
            </Badge>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            <span>{formatFileSize(document.fileSize)}</span>
            {document.status === DocumentStatus.COMPLETED && (
              <>
                <span>•</span>
                <span>{document.chunkCount} chunks</span>
                {document.pageCount && (
                  <>
                    <span>•</span>
                    <span>{document.pageCount} pages</span>
                  </>
                )}
              </>
            )}
            {document.status === DocumentStatus.FAILED &&
              document.errorMessage && (
                <>
                  <span>•</span>
                  <span className="text-red-500 truncate max-w-[200px]">
                    {document.errorMessage}
                  </span>
                </>
              )}
          </div>

          {/* Metadata */}
          {document.metadata?.title && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 truncate">
              {document.metadata.title}
            </p>
          )}
        </div>

        {/* Actions */}
        {onDelete && (
          <button
            onClick={() => onDelete(document.id)}
            disabled={isDeleting}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <svg
                className="w-5 h-5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Word/Character Count */}
      {document.status === DocumentStatus.COMPLETED && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
          {document.wordCount && (
            <span>{document.wordCount.toLocaleString()} words</span>
          )}
          {document.characterCount && (
            <span>{document.characterCount.toLocaleString()} chars</span>
          )}
          {document.embeddingCount > 0 && (
            <span className="text-brand-purple-500">
              {document.embeddingCount} embeddings
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Skeleton loader for document cards
export function DocumentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}
