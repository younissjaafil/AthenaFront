"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
} from "@/lib/types/document";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  accept = Object.keys(ALLOWED_FILE_TYPES).join(","),
  maxSize = MAX_FILE_SIZE,
  disabled = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Inline validation
      if (file.size > maxSize) {
        setError(`File too large. Maximum size is ${formatFileSize(maxSize)}`);
        return;
      }
      const allowedTypes = Object.keys(ALLOWED_FILE_TYPES);
      if (!allowedTypes.includes(file.type)) {
        setError(
          `Unsupported file type. Allowed: PDF, DOCX, TXT, MD, HTML, CSV, JSON`
        );
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, maxSize]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, isUploading, handleFile]
  );

  const handleClick = () => {
    if (!disabled && !isUploading) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
    // Reset input
    e.target.value = "";
  };

  return (
    <div className={className}>
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          borderColor: isDragging
            ? "rgb(139, 92, 246)"
            : error
            ? "rgb(239, 68, 68)"
            : "rgb(229, 231, 235)",
          backgroundColor: isDragging
            ? "rgba(139, 92, 246, 0.05)"
            : "transparent",
        }}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all",
          "hover:border-brand-purple-400 hover:bg-brand-purple-50/50 dark:hover:bg-brand-purple-950/20",
          isDragging && "border-brand-purple-500 bg-brand-purple-50/50",
          error && "border-red-500",
          (disabled || isUploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />

        <AnimatePresence mode="wait">
          {isUploading ? (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              {/* Upload Progress */}
              <div className="w-16 h-16 mx-auto relative">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-brand-purple-500"
                    strokeDasharray={176}
                    initial={{ strokeDashoffset: 176 }}
                    animate={{
                      strokeDashoffset: 176 - (176 * uploadProgress) / 100,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-semibold text-brand-purple-600">
                    {uploadProgress}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Uploading document...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              {/* Upload Icon */}
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-purple-100 dark:bg-brand-purple-900/30 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-brand-purple-600 dark:text-brand-purple-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              {/* Main Text */}
              <div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-200">
                  <span className="text-brand-purple-600 dark:text-brand-purple-400 hover:underline">
                    Click to upload
                  </span>{" "}
                  or drag and drop
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  PDF, DOCX, TXT, MD, HTML, CSV, or JSON
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Maximum file size: {formatFileSize(maxSize)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag Overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-brand-purple-500/10 rounded-xl flex items-center justify-center"
            >
              <p className="text-brand-purple-600 dark:text-brand-purple-400 font-medium">
                Drop file here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact file preview card
interface FilePreviewProps {
  file: File;
  onRemove?: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function FilePreview({
  file,
  onRemove,
  isUploading,
  uploadProgress = 0,
}: FilePreviewProps) {
  const fileType =
    ALLOWED_FILE_TYPES[file.type as keyof typeof ALLOWED_FILE_TYPES];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* File Icon */}
      <div className="w-10 h-10 rounded-lg bg-brand-purple-100 dark:bg-brand-purple-900/30 flex items-center justify-center text-xl">
        {fileType?.icon || "📄"}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(file.size)} • {fileType?.label || "Document"}
        </p>
      </div>

      {/* Progress or Remove */}
      {isUploading ? (
        <div className="w-8 h-8 relative">
          <svg className="w-8 h-8 transform -rotate-90">
            <circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-200 dark:text-gray-700"
            />
            <motion.circle
              cx="16"
              cy="16"
              r="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-brand-purple-500"
              strokeDasharray={88}
              initial={{ strokeDashoffset: 88 }}
              animate={{ strokeDashoffset: 88 - (88 * uploadProgress) / 100 }}
            />
          </svg>
        </div>
      ) : (
        onRemove && (
          <button
            onClick={onRemove}
            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          >
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
          </button>
        )
      )}
    </motion.div>
  );
}
