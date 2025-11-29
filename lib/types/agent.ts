// Agent types matching backend entities

export enum AgentVisibility {
  PUBLIC = "public",
  PRIVATE = "private",
  UNLISTED = "unlisted",
}

export enum AgentStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

export enum AIModel {
  GPT_4 = "gpt-4",
  GPT_4_TURBO = "gpt-4-turbo",
  GPT_35_TURBO = "gpt-3.5-turbo",
}

export interface Agent {
  id: string;
  creatorId: string;
  name: string;
  tagline?: string;
  description: string;
  systemPrompt: string;
  welcomeMessage?: string;

  // AI Configuration
  model: AIModel;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;

  // Categorization
  category: string;
  tags: string[];

  // Pricing
  pricePerMessage: number;
  pricePerMonth: number;
  isFree: boolean;

  // Visibility & Status
  visibility: AgentVisibility;
  status: AgentStatus;

  // Media
  avatarUrl?: string;
  coverImageUrl?: string;

  // RAG Configuration
  ragEnabled: boolean;
  ragContextSize: number;
  ragSimilarityThreshold: number;

  // Statistics
  totalConversations: number;
  totalMessages: number;
  averageRating: number;
  totalReviews: number;
  totalDocuments: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  name: string;
  tagline?: string;
  description: string;
  systemPrompt: string;
  welcomeMessage?: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  category: string;
  tags?: string[];
  pricePerMessage?: number;
  pricePerMonth?: number;
  isFree?: boolean;
  visibility?: AgentVisibility;
  status?: AgentStatus;
  avatarUrl?: string;
  coverImageUrl?: string;
  ragEnabled?: boolean;
  ragContextSize?: number;
  ragSimilarityThreshold?: number;
}

export interface UpdateAgentDto extends Partial<CreateAgentDto> {}

// Category options for the form
export const AGENT_CATEGORIES = [
  "Education",
  "Productivity",
  "Creative",
  "Business",
  "Entertainment",
  "Health & Wellness",
  "Technology",
  "Finance",
  "Legal",
  "Other",
] as const;

// Model display names
export const AI_MODEL_DISPLAY: Record<AIModel, string> = {
  [AIModel.GPT_4]: "GPT-4",
  [AIModel.GPT_4_TURBO]: "GPT-4 Turbo",
  [AIModel.GPT_35_TURBO]: "GPT-3.5 Turbo",
};
