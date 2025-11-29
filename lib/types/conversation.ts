// Conversation and Message types matching backend

export enum ConversationStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

export enum MessageRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: {
    model?: string;
    ragContext?: boolean;
    ragSources?: RagSource[];
    tokensUsed?: number;
  };
  tokenCount?: number;
  createdAt: string;
}

export interface RagSource {
  documentId: string;
  chunkIndex: number;
  similarity: number;
  documentName?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  agentId: string;
  title?: string;
  status: ConversationStatus;
  messageCount: number;
  lastMessageAt?: string;
  agent?: {
    id: string;
    name: string;
    tagline: string;
    profileImageUrl?: string;
  };
  messages?: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationDto {
  agentId: string;
  title?: string;
}

export interface SendMessageDto {
  content: string;
  useRag?: boolean;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage: Message;
}

// Agent with creator info for public display
export interface PublicAgent {
  id: string;
  name: string;
  description?: string;
  category: string[];
  tags: string[];
  profileImageUrl?: string;
  isFree: boolean;
  pricePerMessage: number;
  pricePerConversation: number;
  averageRating: number;
  totalConversations: number;
  creator?: {
    id: string;
    title: string;
    user?: {
      firstName?: string;
      lastName?: string;
      profileImageUrl?: string;
    };
  };
}
