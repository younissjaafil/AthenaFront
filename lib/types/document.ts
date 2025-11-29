// Document types matching backend entities

export enum DocumentStatus {
  UPLOADED = "uploaded",
  PROCESSING = "processing",
  PROCESSED = "processed",
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
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number; // in bytes
  s3Url?: string;
  status: string;
  chunkCount: number;
  embeddingCount: number;
  errorMessage?: string;
  metadata?: DocumentMetadata;
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

export function getStatusColor(status: string): string {
  switch (status) {
    case DocumentStatus.PROCESSED:
      return "success";
    case DocumentStatus.PROCESSING:
      return "info";
    case DocumentStatus.UPLOADED:
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
