"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { FileText, X, Loader2, AlertCircle } from "lucide-react";
import { useDocumentPreview } from "@/hooks/useDocuments";
import { FlipbookPdfViewer } from "./FlipbookPdfViewer";

export interface PreviewDocument {
  id: string;
  filename?: string;
  originalFilename?: string;
  fileType: string;
  fileSize: number;
  extractedText?: string;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
}

interface DocumentPreviewModalProps {
  document: PreviewDocument | null;
  onClose: () => void;
}

export function DocumentPreviewModal({
  document,
  onClose,
}: DocumentPreviewModalProps) {
  const {
    data: previewData,
    isLoading,
    error,
  } = useDocumentPreview(document?.id || null);

  if (!document) return null;

  const isPdf = document.fileType?.toLowerCase() === "pdf";
  const isDocx =
    document.fileType?.toLowerCase() === "docx" ||
    document.fileType?.toLowerCase() === "doc";

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {document.metadata?.title ||
                  document.originalFilename ||
                  document.filename}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {document.fileType?.toUpperCase()} •{" "}
                {(document.fileSize / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Document Preview Content */}
          <div className="h-[calc(100%-80px)] overflow-auto bg-gray-50 dark:bg-gray-950 select-none">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  Loading document preview...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Failed to load document preview.
                  <br />
                  Please try again later.
                </p>
              </div>
            ) : previewData?.previewUrl && isPdf ? (
              <FlipbookPdfViewer
                pdfUrl={previewData.previewUrl}
                title={
                  (document.metadata?.title as string) ||
                  document.originalFilename ||
                  "Document"
                }
                onClose={onClose}
              />
            ) : isDocx ? (
              <div className="p-8 max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                  {document.metadata?.title && (
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {document.metadata.title}
                    </h1>
                  )}
                  {document.metadata?.description && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 border-l-4 border-purple-500 pl-4">
                      {document.metadata.description}
                    </p>
                  )}
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {document.extractedText ||
                        "Document content is being processed..."}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                  Preview not available for{" "}
                  {document.fileType?.toUpperCase() || "this"} files
                </p>
                {document.extractedText && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg max-w-2xl max-h-96 overflow-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {document.extractedText.slice(0, 2000)}
                      {document.extractedText.length > 2000 && "..."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
