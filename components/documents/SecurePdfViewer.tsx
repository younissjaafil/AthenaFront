"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";

interface SecurePdfViewerProps {
  documentId: string;
  title?: string;
  onClose?: () => void;
  className?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Simple button component
function IconButton({
  onClick,
  disabled,
  children,
  className = "",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        disabled
          ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-purple-600"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function SecurePdfViewer({
  documentId,
  title,
  onClose,
  className = "",
}: SecurePdfViewerProps) {
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<Map<number, string>>(new Map());
  const [loadingPages, setLoadingPages] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch page count on mount
  useEffect(() => {
    const fetchPageCount = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/preview/info`
        );
        if (!response.ok) {
          throw new Error("Failed to load document info");
        }
        const data = await response.json();
        setPageCount(data.pageCount);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load document"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPageCount();
  }, [documentId]);

  // Load page image
  const loadPageImage = useCallback(
    async (page: number) => {
      if (pageImages.has(page) || loadingPages.has(page)) {
        return;
      }

      setLoadingPages((prev) => new Set(prev).add(page));

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/documents/${documentId}/preview/${page}`
        );
        if (!response.ok) {
          throw new Error(`Failed to load page ${page}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setPageImages((prev) => new Map(prev).set(page, url));
      } catch (err) {
        console.error(`Failed to load page ${page}:`, err);
      } finally {
        setLoadingPages((prev) => {
          const next = new Set(prev);
          next.delete(page);
          return next;
        });
      }
    },
    [documentId, pageImages, loadingPages]
  );

  // Preload current and adjacent pages
  useEffect(() => {
    if (pageCount === 0) return;

    // Load current page and 2 pages ahead
    const pagesToLoad = [
      currentPage,
      currentPage + 1,
      currentPage + 2,
      currentPage - 1,
    ].filter((p) => p >= 1 && p <= pageCount);

    pagesToLoad.forEach((page) => {
      loadPageImage(page);
    });
  }, [currentPage, pageCount, loadPageImage]);

  // Navigation handlers
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= pageCount) {
        setCurrentPage(page);
      }
    },
    [pageCount]
  );

  const prevPage = useCallback(
    () => goToPage(currentPage - 1),
    [goToPage, currentPage]
  );
  const nextPage = useCallback(
    () => goToPage(currentPage + 1),
    [goToPage, currentPage]
  );

  // Zoom handlers
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const resetZoom = () => setZoom(1);

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevPage();
      if (e.key === "ArrowRight") nextPage();
      if (e.key === "Escape" && onClose) onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevPage, nextPage, onClose]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      pageImages.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pageImages]);

  if (loading) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-900 rounded-xl ${className}`}
      >
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">
          Loading document...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex flex-col items-center justify-center h-[600px] bg-gray-100 dark:bg-gray-900 rounded-xl ${className}`}
      >
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="mt-4 text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const currentPageUrl = pageImages.get(currentPage);

  return (
    <div
      className={`flex flex-col bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden ${className}`}
      onContextMenu={handleContextMenu}
      style={{ userSelect: "none" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-purple-500" />
          {title && (
            <span className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
              {title}
            </span>
          )}
        </div>

        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <IconButton onClick={prevPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[80px] text-center">
            Page {currentPage} of {pageCount}
          </span>
          <IconButton onClick={nextPage} disabled={currentPage >= pageCount}>
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <IconButton onClick={zoomOut} disabled={zoom <= 0.5}>
            <ZoomOut className="h-4 w-4" />
          </IconButton>
          <button
            onClick={resetZoom}
            className="text-sm text-gray-600 dark:text-gray-400 min-w-[50px] text-center hover:text-purple-500"
          >
            {Math.round(zoom * 100)}%
          </button>
          <IconButton onClick={zoomIn} disabled={zoom >= 3}>
            <ZoomIn className="h-4 w-4" />
          </IconButton>
          {onClose && (
            <IconButton onClick={onClose} className="ml-2">
              <X className="h-4 w-4" />
            </IconButton>
          )}
        </div>
      </div>

      {/* Page Display */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-start justify-center p-4 min-h-[500px]"
        style={{
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        {loadingPages.has(currentPage) && !currentPageUrl ? (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading page {currentPage}...
            </p>
          </div>
        ) : currentPageUrl ? (
          <div
            className="relative shadow-lg bg-white"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease-out",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentPageUrl}
              alt={`Page ${currentPage}`}
              className="max-w-full h-auto pointer-events-none"
              draggable={false}
              style={
                {
                  maxHeight: "80vh",
                  WebkitUserDrag: "none",
                } as React.CSSProperties
              }
            />
            {/* Watermark overlay (optional) */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center overflow-hidden"
              style={{ transform: "rotate(-45deg)" }}
            >
              <span className="text-6xl font-bold text-gray-900 whitespace-nowrap">
                ATHENA
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[500px]">
            <AlertCircle className="h-8 w-8 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Failed to load page
            </p>
          </div>
        )}
      </div>

      {/* Page Thumbnails (bottom strip) */}
      {pageCount > 1 && (
        <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
          {Array.from({ length: Math.min(pageCount, 10) }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`flex-shrink-0 w-12 h-16 rounded border-2 flex items-center justify-center text-xs font-medium transition-colors ${
                  page === currentPage
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-600"
                    : "border-gray-200 dark:border-gray-600 hover:border-purple-300 text-gray-600 dark:text-gray-400"
                }`}
              >
                {page}
              </button>
            )
          )}
          {pageCount > 10 && (
            <span className="text-sm text-gray-500 px-2">
              +{pageCount - 10} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
