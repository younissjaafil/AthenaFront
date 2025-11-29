// Agent types matching backend entities

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
  description?: string;
  systemPrompt: string;

  // AI Configuration
  model: AIModel;
  temperature: number;
  maxTokens: number;

  // Categorization
  category: string[];
  tags: string[];

  // Pricing
  pricePerMessage: number;
  pricePerConversation: number;
  isFree: boolean;

  // Visibility & Status
  isPublic: boolean;
  status: AgentStatus;

  // Media
  profileImageUrl?: string;

  // RAG Configuration
  useRag: boolean;
  ragMaxResults: number;
  ragMaxTokens: number;

  // Statistics
  totalConversations: number;
  totalMessages: number;
  averageRating: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  name: string;
  description?: string;
  systemPrompt: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  category?: string[];
  tags?: string[];
  pricePerMessage?: number;
  pricePerConversation?: number;
  isFree?: boolean;
  isPublic?: boolean;
  status?: AgentStatus;
  profileImageUrl?: string;
  useRag?: boolean;
  ragMaxResults?: number;
  ragMaxTokens?: number;
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
