"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";
import {
  useDocumentPreviewInfo,
  useDocumentPreviewPage,
  useGeneratePreviews,
} from "@/hooks/useDocuments";

interface SecurePdfViewerProps {
  documentId: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

export function SecurePdfViewer({
  documentId,
  title,
  onClose,
  className = "",
}: SecurePdfViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Fetch preview info
  const {
    data: previewInfo,
    isLoading: isLoadingInfo,
    error: infoError,
  } = useDocumentPreviewInfo(documentId);

  // Fetch current page preview URL
  const {
    data: pageData,
    isLoading: isLoadingPage,
    error: pageError,
    refetch: refetchPage,
  } = useDocumentPreviewPage(documentId, currentPage);

  // Generate previews mutation
  const generatePreviews = useGeneratePreviews();

  const pageCount = previewInfo?.pageCount || 0;
  const hasPreview = previewInfo?.hasPreviewsGenerated;
  const previewAvailable = previewInfo?.previewAvailable;

  // Navigation
  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(pageCount, p + 1));
  }, [pageCount]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevPage, goToNextPage, onClose]);

  // Zoom controls
  const zoomIn = () => setZoom((z) => Math.min(200, z + 25));
  const zoomOut = () => setZoom((z) => Math.max(50, z - 25));

  // Handle generate previews
  const handleGeneratePreviews = async () => {
    try {
      await generatePreviews.mutateAsync(documentId);
    } catch (error) {
      console.error("Failed to generate previews:", error);
    }
  };

  // Loading state
  if (isLoadingInfo) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ minHeight: 400 }}
      >
        <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Loading preview...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (infoError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ minHeight: 400 }}
      >
        <div className="flex flex-col items-center gap-3 text-red-500">
          <AlertCircle className="h-8 w-8" />
          <span>Failed to load preview info</span>
        </div>
      </div>
    );
  }

  // No preview available - offer to generate
  if (!hasPreview) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}
        style={{ minHeight: 400 }}
      >
        <div className="flex flex-col items-center gap-4 text-gray-600 dark:text-gray-400 p-8 text-center">
          <FileText className="h-12 w-12" />
          <div className="space-y-2">
            <p className="font-medium">Preview not available</p>
            {previewAvailable ? (
              <>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  This document hasn&apos;t been processed for preview yet.
                </p>
                <button
                  onClick={handleGeneratePreviews}
                  disabled={generatePreviews.isPending}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatePreviews.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      Generate Preview
                    </>
                  )}
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Preview generation is not available at this time.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className}`}
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-white">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate">
            {title || "Document"}
          </span>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-2 mx-4">
          <button
            onClick={goToPrevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm tabular-nums min-w-[4rem] text-center">
            {currentPage} / {pageCount}
          </span>
          <button
            onClick={goToNextPage}
            disabled={currentPage >= pageCount}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            disabled={zoom <= 50}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="text-sm w-12 text-center tabular-nums">{zoom}%</span>
          <button
            onClick={zoomIn}
            disabled={zoom >= 200}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-5 w-5" />
          </button>

          {/* Close button */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Preview image container */}
      <div
        className="flex-1 overflow-auto bg-gray-700 flex items-center justify-center p-4"
        style={{ minHeight: 500 }}
        // Disable right-click to prevent downloading
        onContextMenu={(e) => e.preventDefault()}
      >
        {isLoadingPage ? (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading page {currentPage}...</span>
          </div>
        ) : pageError ? (
          <div className="flex flex-col items-center gap-3 text-red-400">
            <AlertCircle className="h-8 w-8" />
            <span>Failed to load page</span>
            <button
              onClick={() => refetchPage()}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : pageData?.url ? (
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center",
              transition: "transform 0.2s ease",
            }}
          >
            {/* Using regular img for external S3 signed URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pageData.url}
              alt={`Page ${currentPage}`}
              className="max-w-full shadow-2xl rounded select-none"
              style={{
                maxHeight: "70vh",
                userSelect: "none",
                pointerEvents: "none",
              }}
              draggable={false}
            />
          </div>
        ) : null}
      </div>

      {/* Footer with watermark notice */}
      <div className="px-4 py-2 bg-gray-800 text-gray-400 text-xs text-center">
        🔒 Secure Preview • Watermarked • Page {currentPage} of {pageCount}
      </div>
    </div>
  );
}

export default SecurePdfViewer;
