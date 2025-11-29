// Document types matching backend entities

export enum DocumentStatus {
  UPLOADING = "uploading",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum DocumentType {
  PDF = "pdf",
  DOCX = "docx",
  TXT = "txt",
  MD = "md",
  HTML = "html",
  CSV = "csv",
  JSON = "json",
}

export interface DocumentMetadata {
  title?: string;
  author?: string;
  language?: string;
  tags?: string[];
  description?: string;
  [key: string]: unknown;
}

export interface Document {
  id: string;
  agentId: string;
  userId: string;
  filename: string;
  originalName: string;
  type: DocumentType;
  mimeType: string;
  fileSize: number; // in bytes
  s3Key: string;
  s3Bucket: string;
  s3Url?: string;
  status: DocumentStatus;
  chunkCount: number;
  embeddingCount: number;
  extractedText?: string;
  characterCount?: number;
  wordCount?: number;
  pageCount?: number;
  errorMessage?: string;
  retryCount: number;
  metadata?: DocumentMetadata;
  processingStartedAt?: string;
  processingCompletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentStats {
  totalDocuments: number;
  totalChunks: number;
  totalEmbeddings: number;
  totalSize: number;
  byStatus: Record<DocumentStatus, number>;
  byType: Record<DocumentType, number>;
}

export interface UploadDocumentDto {
  agentId: string;
  title?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

// File type configurations
export const ALLOWED_FILE_TYPES = {
  "application/pdf": { extension: "pdf", icon: "📄", label: "PDF" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extension: "docx",
    icon: "📝",
    label: "Word",
  },
  "text/plain": { extension: "txt", icon: "📃", label: "Text" },
  "text/markdown": { extension: "md", icon: "📋", label: "Markdown" },
  "text/html": { extension: "html", icon: "🌐", label: "HTML" },
  "text/csv": { extension: "csv", icon: "📊", label: "CSV" },
  "application/json": { extension: "json", icon: "🔧", label: "JSON" },
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export const FILE_TYPE_ICONS: Record<string, string> = {
  pdf: "📄",
  docx: "📝",
  txt: "📃",
  md: "📋",
  html: "🌐",
  csv: "📊",
  json: "🔧",
};

export function getStatusColor(status: DocumentStatus): string {
  switch (status) {
    case DocumentStatus.COMPLETED:
      return "success";
    case DocumentStatus.PROCESSING:
      return "info";
    case DocumentStatus.UPLOADING:
      return "warning";
    case DocumentStatus.FAILED:
      return "danger";
    default:
      return "default";
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
