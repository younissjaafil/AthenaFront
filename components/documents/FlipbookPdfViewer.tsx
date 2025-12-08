"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Dynamic imports to avoid SSR issues
let pdfjs: typeof import("pdfjs-dist") | null = null;

interface FlipbookPdfViewerProps {
  /** Direct URL to the PDF file (should be a signed S3 URL) */
  pdfUrl: string;
  /** Document title to display */
  title?: string;
  /** Callback when close button is clicked */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
}

type ViewMode = "single" | "scroll";

export function FlipbookPdfViewer({
  pdfUrl,
  title = "Document",
  onClose,
  className = "",
}: FlipbookPdfViewerProps) {
  const router = useRouter();
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("single");

  // Pan/Zoom state
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleExit = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [onClose, router]);

  // Reset pan when page changes
  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [currentPage]);

  // Mouse/Touch handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1 || viewMode === "single") {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPan({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && e.touches.length === 1) {
      // Prevent scrolling document while dragging
      if (scale > 1) e.preventDefault();
      setPan({
        x: e.touches[0].clientX - dragStart.current.x,
        y: e.touches[0].clientY - dragStart.current.y,
      });
    }
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Detect mobile device - simple check on mount
  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      // Increase threshold to 1024px to catch tablets and landscape phones
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("scroll");
        setScale(1);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load libraries dynamically
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjs = pdfjsLib;

        // Use CDN for worker to ensure version match with fonts
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs";

        // Configure standard fonts for better text rendering
        const PDFJS_CDN = "https://unpkg.com/pdfjs-dist@4.4.168";
        (
          pdfjsLib as any
        ).GlobalWorkerOptions.standardFontDataUrl = `${PDFJS_CDN}/standard_fonts/`;

        setLibsLoaded(true);
      } catch (err) {
        console.error("Failed to load libraries:", err);
        setError("Failed to load PDF viewer libraries");
        setIsLoading(false);
      }
    };
    loadLibraries();
  }, []);

  // Load PDF and render pages
  useEffect(() => {
    if (!pdfUrl || !libsLoaded || !pdfjs) return;

    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);

      try {
        const loadingTask = pdfjs!.getDocument({
          url: pdfUrl,
          // Use CDN for standard fonts
          standardFontDataUrl:
            "https://unpkg.com/pdfjs-dist@4.4.168/standard_fonts/",
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.4.168/cmaps/",
          cMapPacked: true,
          // On mobile, force path rendering to fix "J aafil" spacing artifacts
          // On desktop, allow native font loading for crisper text
          disableFontFace: isMobile,
        });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        const pageImages: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);

          // 3x scale is sufficient for mobile high DPI and avoids downscaling artifacts (too bold)
          const RENDER_SCALE = 5;
          const viewport = page.getViewport({ scale: RENDER_SCALE });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;

          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);

          // White background
          context.fillStyle = "#FFFFFF";
          context.fillRect(0, 0, canvas.width, canvas.height);

          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // PNG for quality
          const imageUrl = canvas.toDataURL("image/png");
          pageImages.push(imageUrl);
          setLoadingProgress(Math.round((i / pdf.numPages) * 100));
        }

        setPages(pageImages);
        setIsLoading(false);
      } catch (err: any) {
        console.error("Failed to load PDF:", err);
        setError(err.message || "Failed to load PDF document");
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl, libsLoaded, isMobile]);

  // Navigation
  const goToPrevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(1, p - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(pageCount, p + 1));
  }, [pageCount]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(3, s + 0.25));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(0.5, s - 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode === "single") {
        if (e.key === "ArrowLeft" || e.key === "ArrowUp") goToPrevPage();
        if (e.key === "ArrowRight" || e.key === "ArrowDown") goToNextPage();
      }
      if (e.key === "Escape" && onClose) onClose();
      if (!isMobile) {
        if (e.key === "+" || e.key === "=") zoomIn();
        if (e.key === "-") zoomOut();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    goToPrevPage,
    goToNextPage,
    onClose,
    viewMode,
    isMobile,
    zoomIn,
    zoomOut,
  ]);

  // Scroll to page in scroll mode
  useEffect(() => {
    if (viewMode === "scroll" && scrollContainerRef.current) {
      const pageElement = scrollContainerRef.current.querySelector(
        `[data-page="${currentPage}"]`
      );
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [currentPage, viewMode]);

  // Loading state
  if (isLoading || !libsLoaded) {
    const loadingContent = (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden h-full ${className} ${
          isMobile ? "fixed inset-0 z-[9999]" : ""
        }`}
      >
        <Header
          title={title}
          onClose={onClose || isMobile ? handleExit : undefined}
        />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
            <span className="text-lg">Loading PDF...</span>
            {loadingProgress > 0 && (
              <div className="w-48">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {loadingProgress}%
                </span>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );

    if (mounted && isMobile) {
      return createPortal(loadingContent, document.body);
    }
    return loadingContent;
  }

  // Error state
  if (error) {
    const errorContent = (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden h-full ${className} ${
          isMobile ? "fixed inset-0 z-[9999]" : ""
        }`}
      >
        <Header
          title={title}
          onClose={onClose || isMobile ? handleExit : undefined}
        />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex flex-col items-center gap-4 text-red-400 max-w-md text-center px-4">
            <AlertCircle className="h-12 w-12" />
            <span className="text-lg font-medium">Failed to load PDF</span>
            <span className="text-sm text-gray-500">{error}</span>
          </div>
        </div>
        <Footer />
      </div>
    );

    if (mounted && isMobile) {
      return createPortal(errorContent, document.body);
    }
    return errorContent;
  }

  // No pages
  if (pages.length === 0) {
    return (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden h-full ${className}`}
      >
        <Header
          title={title}
          onClose={onClose || isMobile ? handleExit : undefined}
        />
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
          <span className="text-gray-500">No pages found in document</span>
        </div>
        <Footer />
      </div>
    );
  }

  const viewerContent = (
    <div
      ref={containerRef}
      className={`flex flex-col bg-gray-900 overflow-hidden ${className} ${
        isFullscreen || onClose || isMobile
          ? "fixed inset-0 z-[9999] rounded-none" // Max z-index to cover everything
          : "h-full rounded-lg"
      }`}
    >
      {/* Header with controls */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gray-800 text-white border-b border-gray-700 z-10 shadow-md">
        <span className="text-sm font-medium truncate flex-1 mr-2">
          {title}
        </span>

        <div className="flex items-center gap-1">
          {/* View mode toggle - Desktop only */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() =>
                setViewMode(viewMode === "single" ? "scroll" : "single")
              }
              className={`p-2 rounded hover:bg-gray-700 transition-colors ${
                viewMode === "scroll" ? "bg-gray-700" : ""
              }`}
              title={viewMode === "single" ? "Scroll view" : "Single page view"}
            >
              {viewMode === "single" ? (
                <Grid className="h-4 w-4" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
            </button>
            <div className="w-px h-6 bg-gray-600 mx-1" />
          </div>

          {/* Zoom controls */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            title="Zoom out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          {/* Hide percentage on very small screens */}
          <button
            onClick={resetZoom}
            className="hidden sm:block px-2 py-1 text-xs rounded hover:bg-gray-700 transition-colors min-w-[50px]"
            title="Reset zoom"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            disabled={scale >= 3}
            className="p-2 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            title="Zoom in (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <div className="w-px h-6 bg-gray-600 mx-1" />

          {/* Fullscreen - Hide on mobile since it's forced full */}
          <button
            onClick={toggleFullscreen}
            className="hidden md:block p-2 rounded hover:bg-gray-700 transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Close - Always visible on mobile or if onClose provided */}
          {(onClose || isMobile) && (
            <button
              onClick={handleExit}
              className="p-2 rounded hover:bg-gray-700 transition-colors ml-1 bg-gray-700/50"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden bg-gray-950">
        {viewMode === "single" ? (
          /* Single page view */
          <div className="h-full flex items-center justify-center p-2">
            {/* Navigation arrows - smaller on mobile */}
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className={`absolute left-2 md:left-4 z-10 ${
                isMobile ? "p-2" : "p-3"
              } bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 transition-all`}
              title="Previous page"
            >
              <ChevronLeft
                className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} text-white`}
              />
            </button>

            <button
              onClick={goToNextPage}
              disabled={currentPage >= pageCount}
              className={`absolute right-2 md:right-4 z-10 ${
                isMobile ? "p-2" : "p-3"
              } bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 transition-all`}
              title="Next page"
            >
              <ChevronRight
                className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} text-white`}
              />
            </button>

            {/* Page image */}
            <div
              className="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className={`shadow-2xl rounded-sm ${
                  isMobile
                    ? "w-full h-auto"
                    : "max-w-full max-h-full object-contain"
                }`}
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                  transformOrigin: "center",
                  pointerEvents: "none", // Let events pass to container for dragging
                  userSelect: "none",
                  // Critical for mobile: prevent browser from blurring the image
                  imageRendering: "auto",
                  WebkitFontSmoothing: "antialiased",
                  willChange: "transform",
                }}
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>

            {/* Watermark */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03]">
              <span className="text-8xl font-bold text-white rotate-[-30deg] select-none whitespace-nowrap">
                ATHENA
              </span>
            </div>
          </div>
        ) : (
          /* Scroll view - all pages vertically (mobile-friendly) */
          <div
            ref={scrollContainerRef}
            className="h-full overflow-auto bg-gray-900"
          >
            <div className={`space-y-6 ${isMobile ? "p-2" : "p-6"}`}>
              {pages.map((pageImage, index) => (
                <div
                  key={index}
                  data-page={index + 1}
                  className="flex justify-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pageImage}
                    alt={`Page ${index + 1}`}
                    className={`shadow-2xl ${
                      isMobile
                        ? "rounded" // Mobile: full width, slightly rounded
                        : "max-w-full rounded-lg" // Desktop: more rounded
                    }`}
                    style={
                      isMobile
                        ? {
                            // Mobile: use width for scaling to allow scrolling
                            display: "block",
                            width: `${100 * scale}%`,
                            maxWidth: "none",
                            height: "auto",
                            transition: "width 0.2s ease-out",
                          }
                        : {
                            // Desktop: allow zoom
                            transform: `scale(${scale})`,
                            transformOrigin: "top center",
                            pointerEvents: "none",
                            userSelect: "none",
                          }
                    }
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                </div>
              ))}
            </div>

            {/* Watermark - subtle */}
            <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.015] z-10">
              <span className="text-8xl font-bold text-white rotate-[-30deg] select-none whitespace-nowrap">
                ATHENA
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Page navigation bar */}
      <div className="px-4 py-3 bg-gray-800 flex items-center justify-center gap-4 border-t border-gray-700">
        {viewMode === "single" && (
          <>
            <button
              onClick={goToPrevPage}
              disabled={currentPage <= 1}
              className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 transition-colors"
            >
              <ChevronUp className="h-4 w-4 text-white" />
            </button>
          </>
        )}

        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={pageCount}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (page >= 1 && page <= pageCount) {
                setCurrentPage(page);
              }
            }}
            className="w-14 px-2 py-1 text-center text-sm bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
          />
          <span className="text-sm text-gray-400">of {pageCount}</span>
        </div>

        {viewMode === "single" && (
          <button
            onClick={goToNextPage}
            disabled={currentPage >= pageCount}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-30 transition-colors"
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </button>
        )}

        {/* Page slider */}
        <input
          type="range"
          min={1}
          max={pageCount}
          value={currentPage}
          onChange={(e) => setCurrentPage(parseInt(e.target.value))}
          className="flex-1 max-w-xs h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* Footer branding */}
      <Footer />
    </div>
  );

  // Use Portal for mobile/fullscreen to break out of parent containers
  if (mounted && (isMobile || isFullscreen)) {
    return createPortal(viewerContent, document.body);
  }

  return viewerContent;
}

// Header component
function Header({ title, onClose }: { title: string; onClose?: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
      <span className="text-sm font-medium truncate flex-1">{title}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 p-1.5 rounded hover:bg-gray-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

// Footer component
function Footer() {
  return (
    <div className="px-4 py-2 bg-gradient-to-r from-purple-600 to-teal-500 text-center">
      <span className="text-xs font-semibold text-white tracking-wide">
        📚 athena-ai.pro
      </span>
    </div>
  );
}

export default FlipbookPdfViewer;
