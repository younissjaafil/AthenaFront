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

// ===== UNIFIED DOCUMENT ENUMS =====
export enum DocumentOwnerType {
  AGENT = "AGENT",
  CREATOR = "CREATOR",
}

export enum DocumentKind {
  DOC = "DOC",
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
}

export enum DocumentVisibility {
  PUBLIC = "PUBLIC",
  FOLLOWERS = "FOLLOWERS",
  SUBSCRIBERS = "SUBSCRIBERS",
  PRIVATE = "PRIVATE",
}

export enum DocumentPricingType {
  FREE = "FREE",
  ONE_TIME = "ONE_TIME",
  SUBSCRIPTION = "SUBSCRIPTION",
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
  // Ownership
  ownerType: DocumentOwnerType;
  ownerId: string;
  agentId?: string;
  // File info
  filename: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  s3Url?: string;
  // Status
  status: string;
  chunkCount: number;
  embeddingCount: number;
  errorMessage?: string;
  // Usage flags
  forProfile: boolean;
  forRag: boolean;
  // Classification
  kind: DocumentKind;
  visibility: DocumentVisibility;
  // Monetization
  pricingType: DocumentPricingType;
  priceCents?: number;
  currency: string;
  // Content
  contentHash?: string;
  metadata?: DocumentMetadata;
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PublicDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  s3Url?: string;
  kind: DocumentKind;
  visibility: DocumentVisibility;
  pricingType: DocumentPricingType;
  priceCents?: number;
  currency: string;
  title?: string;
  description?: string;
  status?: DocumentStatus;
  chunkCount?: number;
  createdAt: string;
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

// ===== UNIFIED UPLOAD DTO =====
export interface UnifiedUploadDocumentDto {
  ownerType: DocumentOwnerType;
  ownerId: string;
  forProfile?: boolean;
  forRag?: boolean;
  agentId?: string;
  visibility?: DocumentVisibility;
  pricingType?: DocumentPricingType;
  priceCents?: number;
  currency?: string;
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

// Extended file types for profile content (images, videos, audio)
export const EXTENDED_FILE_TYPES = {
  ...ALLOWED_FILE_TYPES,
  "image/png": { extension: "png", icon: "🖼️", label: "PNG" },
  "image/jpeg": { extension: "jpg", icon: "🖼️", label: "JPEG" },
  "image/gif": { extension: "gif", icon: "🖼️", label: "GIF" },
  "image/webp": { extension: "webp", icon: "🖼️", label: "WebP" },
  "video/mp4": { extension: "mp4", icon: "🎥", label: "MP4" },
  "video/quicktime": { extension: "mov", icon: "🎥", label: "MOV" },
  "video/webm": { extension: "webm", icon: "🎥", label: "WebM" },
  "audio/mpeg": { extension: "mp3", icon: "🎵", label: "MP3" },
  "audio/wav": { extension: "wav", icon: "🎵", label: "WAV" },
  "audio/ogg": { extension: "ogg", icon: "🎵", label: "OGG" },
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
