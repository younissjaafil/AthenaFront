"use client";

import { motion } from "framer-motion";
import {
  FileText,
  Lock,
  Download,
  Eye,
  File,
  FileImage,
  FileSpreadsheet,
  Sparkles,
  Zap,
} from "lucide-react";
import { CreatorDocument } from "@/hooks/useCreators";

interface DocumentsTabProps {
  documents: CreatorDocument[];
  isLoading: boolean;
  creatorId: string;
}

export function DocumentsTab({
  documents,
  isLoading,
  creatorId,
}: DocumentsTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Documents Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          This creator hasn&apos;t shared any documents yet.
        </p>
      </div>
    );
  }

  // For now, all documents from public agents are "free" (part of the agent)
  // Premium documents would require a separate pricing model (Phase 5)
  const freeDocuments = documents;
  const premiumDocuments: CreatorDocument[] = []; // Placeholder for Phase 5

  return (
    <div className="space-y-8">
      {/* Free Documents Section */}
      {freeDocuments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Free Resources
            </h3>
            <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              {freeDocuments.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeDocuments.map((doc, index) => (
              <DocumentCard key={doc.id} document={doc} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Premium Documents Section (Placeholder for Phase 5) */}
      {premiumDocuments.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Premium Resources
            </h3>
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
              {premiumDocuments.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumDocuments.map((doc, index) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                index={index}
                isPremium
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface DocumentCardProps {
  document: CreatorDocument;
  index: number;
  isPremium?: boolean;
}

function DocumentCard({ document, index, isPremium }: DocumentCardProps) {
  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return <FileText className="w-6 h-6" />;
      case "docx":
      case "doc":
        return <File className="w-6 h-6" />;
      case "csv":
      case "xlsx":
        return <FileSpreadsheet className="w-6 h-6" />;
      case "jpg":
      case "jpeg":
      case "png":
        return <FileImage className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const title = document.metadata?.title || document.originalFilename;
  const description = document.metadata?.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`group relative p-4 rounded-xl border transition-all hover:shadow-md ${
        isPremium
          ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700"
          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      }`}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute top-3 right-3">
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
            <Lock className="w-3 h-3" />
            Premium
          </div>
        </div>
      )}

      <div className="flex gap-4">
        {/* File Icon */}
        <div
          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
            isPremium
              ? "bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400"
              : "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
          }`}
        >
          {getFileIcon(document.fileType)}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-white truncate">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-0.5">
              {description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="uppercase font-medium">{document.fileType}</span>
            <span>•</span>
            <span>{formatFileSize(document.fileSize)}</span>
            {document.chunkCount > 0 && (
              <>
                <span>•</span>
                <span>{document.chunkCount} sections</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-2">
        {isPremium ? (
          <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Zap className="w-3.5 h-3.5" />
            Unlock ($4.99)
          </button>
        ) : (
          <>
            <button className="flex items-center gap-1 px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors">
              <Eye className="w-3.5 h-3.5" />
              Preview
            </button>
            {document.s3Url && (
              <a
                href={document.s3Url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </a>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
