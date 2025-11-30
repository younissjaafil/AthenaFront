// Payment types matching backend entities

export enum PaymentCurrency {
  LBP = "LBP",
  USD = "USD",
  AED = "AED",
}

export enum TransactionStatus {
  PENDING = "pending",
  SUCCESS = "success",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum TransactionType {
  AGENT_PURCHASE = "agent_purchase",
  SUBSCRIPTION = "subscription",
  SESSION_BOOKING = "session_booking",
  CREDIT_PURCHASE = "credit_purchase",
}

export enum PricingType {
  FREE = "free",
  PER_MESSAGE = "per_message",
  PER_CONVERSATION = "per_conversation",
  SUBSCRIPTION = "subscription",
}

export interface Transaction {
  id: string;
  userId: string;
  agentId?: string;
  externalId: string | number;
  type?: TransactionType;
  amount: number;
  currency: PaymentCurrency | string;
  status: TransactionStatus;
  invoice?: string;
  collectUrl?: string;
  payerPhoneNumber?: string;
  metadata?: {
    successRedirectUrl?: string;
    failureRedirectUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface Entitlement {
  id: string;
  userId: string;
  agentId: string;
  transactionId?: string;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated from join
  agent?: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
}

export interface CreatePaymentDto {
  amount: number;
  currency: PaymentCurrency;
  invoice: string;
  successRedirectUrl?: string;
  failureRedirectUrl?: string;
}

export interface AgentAccessResponse {
  hasAccess: boolean;
  isFree?: boolean;
  pricePerMessage?: number;
  pricePerConversation?: number;
}

export interface PricingFormData {
  pricingType: PricingType;
  pricePerMessage: number;
  pricePerConversation: number;
  currency: PaymentCurrency;
}
