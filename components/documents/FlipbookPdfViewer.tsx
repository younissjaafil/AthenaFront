"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";

// Dynamic imports to avoid SSR issues
let pdfjs: typeof import("pdfjs-dist") | null = null;
let HTMLFlipBook: React.ComponentType<any> | null = null;

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

interface PageProps {
  number: number;
  children?: React.ReactNode;
}

// Page component for flipbook - must use forwardRef for react-pageflip
const Page = forwardRef<HTMLDivElement, PageProps>(
  ({ number, children }, ref) => {
    return (
      <div
        ref={ref}
        className="bg-white shadow-lg flex items-center justify-center relative overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      >
        {children}
        {/* Page number */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400">
          {number}
        </div>
      </div>
    );
  }
);
Page.displayName = "Page";

export function FlipbookPdfViewer({
  pdfUrl,
  title = "Document",
  onClose,
  className = "",
}: FlipbookPdfViewerProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [libsLoaded, setLibsLoaded] = useState(false);

  const bookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load libraries dynamically
  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load pdfjs-dist
        const pdfjsLib = await import("pdfjs-dist");
        pdfjs = pdfjsLib;

        // Set worker - use CDN for simplicity
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        // Load react-pageflip
        const pageflipModule = await import("react-pageflip");
        HTMLFlipBook = pageflipModule.default;

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

      try {
        // Load the PDF document
        const loadingTask = pdfjs!.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        // Render each page to canvas and extract as image
        const pageImages: string[] = [];
        const baseScale = 1.5; // Higher = better quality

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: baseScale });

          // Create canvas
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d")!;
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          // Convert to data URL
          const imageUrl = canvas.toDataURL("image/jpeg", 0.9);
          pageImages.push(imageUrl);
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
  }, [pdfUrl, libsLoaded]);

  // Navigation
  const goToPrevPage = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  }, []);

  const goToNextPage = useCallback(() => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  }, []);

  // Handle page flip event
  const onFlip = useCallback((e: { data: number }) => {
    setCurrentPage(e.data);
  }, []);

  // Zoom controls
  const zoomIn = () => setScale((s) => Math.min(1.5, s + 0.1));
  const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.1));

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
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevPage, goToNextPage, onClose]);

  // Loading state
  if (isLoading || !libsLoaded) {
    return (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
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
        <div
          className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
          style={{ minHeight: 500 }}
        >
          <div className="flex flex-col items-center gap-4 text-gray-400">
            <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
            <span>Loading PDF...</span>
          </div>
        </div>
        {/* Watermark footer */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-center">
          <span className="text-sm font-semibold text-white tracking-wide">
            📚 athena-ai.pro
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
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
        <div
          className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
          style={{ minHeight: 500 }}
        >
          <div className="flex flex-col items-center gap-4 text-red-400">
            <AlertCircle className="h-10 w-10" />
            <span>Failed to load PDF</span>
            <span className="text-sm text-gray-500">{error}</span>
          </div>
        </div>
        {/* Watermark footer */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-center">
          <span className="text-sm font-semibold text-white tracking-wide">
            📚 athena-ai.pro
          </span>
        </div>
      </div>
    );
  }

  // No pages
  if (pages.length === 0) {
    return (
      <div
        className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
          <span className="text-sm font-medium truncate flex-1">{title}</span>
        </div>
        <div
          className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"
          style={{ minHeight: 500 }}
        >
          <span className="text-gray-500">No pages found in document</span>
        </div>
        {/* Watermark footer */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-center">
          <span className="text-sm font-semibold text-white tracking-wide">
            📚 athena-ai.pro
          </span>
        </div>
      </div>
    );
  }

  // Calculate book dimensions based on container
  const bookWidth =
    Math.min(
      400,
      (typeof window !== "undefined" ? window.innerWidth : 800) * 0.4
    ) * scale;
  const bookHeight = bookWidth * 1.4; // A4 ratio

  return (
    <div
      ref={containerRef}
      className={`flex flex-col bg-gray-900 rounded-lg overflow-hidden ${className} ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <span className="text-sm font-medium truncate flex-1">{title}</span>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Zoom */}
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="text-xs w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={zoomIn}
            disabled={scale >= 1.5}
            className="p-1.5 rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded hover:bg-gray-700 transition-colors"
            title="Toggle fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 rounded hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Flipbook container */}
      <div
        className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden"
        style={{ minHeight: isFullscreen ? "calc(100vh - 120px)" : 500 }}
      >
        {/* Navigation arrows */}
        <button
          onClick={goToPrevPage}
          disabled={currentPage <= 0}
          className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={goToNextPage}
          disabled={currentPage >= pageCount - 1}
          className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full disabled:opacity-30 transition-all"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* The Flipbook */}
        {HTMLFlipBook && (
          <HTMLFlipBook
            ref={bookRef}
            width={bookWidth}
            height={bookHeight}
            size="stretch"
            minWidth={300}
            maxWidth={600}
            minHeight={400}
            maxHeight={800}
            showCover={true}
            flippingTime={600}
            usePortrait={false}
            startZIndex={0}
            autoSize={true}
            maxShadowOpacity={0.5}
            mobileScrollSupport={true}
            onFlip={onFlip}
            className="shadow-2xl"
            style={{}}
            drawShadow={true}
            useMouseEvents={true}
          >
            {pages.map((pageImage, index) => (
              <Page key={index} number={index + 1}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pageImage}
                  alt={`Page ${index + 1}`}
                  className="w-full h-full object-contain"
                  style={{ pointerEvents: "none", userSelect: "none" }}
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </Page>
            ))}
          </HTMLFlipBook>
        )}

        {/* Diagonal watermark overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.04]">
            <span className="text-7xl font-bold text-white rotate-[-30deg] select-none whitespace-nowrap">
              athena-ai.pro
            </span>
          </div>
        </div>
      </div>

      {/* Page indicator */}
      <div className="px-4 py-2 bg-gray-800/80 flex items-center justify-center gap-4">
        <span className="text-sm text-gray-400">
          Page {currentPage + 1} of {pageCount}
        </span>
        <div className="flex-1 max-w-xs">
          <input
            type="range"
            min={0}
            max={pageCount - 1}
            value={currentPage}
            onChange={(e) => {
              const page = parseInt(e.target.value);
              if (bookRef.current) {
                bookRef.current.pageFlip().turnToPage(page);
              }
            }}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>

      {/* Watermark footer - athena-ai.pro branding */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-center">
        <span className="text-sm font-semibold text-white tracking-wide">
          📚 athena-ai.pro
        </span>
      </div>
    </div>
  );
}

export default FlipbookPdfViewer;
