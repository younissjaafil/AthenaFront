"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAgent, useUpdateAgent } from "@/hooks/useAgents";
import { PricingType, PaymentCurrency } from "@/lib/types/payment";
import {
  ArrowLeft,
  DollarSign,
  Gift,
  MessageSquare,
  Repeat,
  CreditCard,
  CheckCircle2,
  Save,
  Loader2,
  Info,
  Sparkles,
} from "lucide-react";

const pricingOptions = [
  {
    type: PricingType.FREE,
    title: "Free",
    description: "Anyone can use this agent without payment",
    icon: Gift,
    color: "emerald",
  },
  {
    type: PricingType.PER_MESSAGE,
    title: "Per Message",
    description: "Users pay for each message sent",
    icon: MessageSquare,
    color: "blue",
  },
  {
    type: PricingType.PER_CONVERSATION,
    title: "Per Conversation",
    description: "Users pay once to start a conversation",
    icon: Repeat,
    color: "purple",
  },
  {
    type: PricingType.SUBSCRIPTION,
    title: "Subscription",
    description: "Users pay for unlimited access (coming soon)",
    icon: CreditCard,
    color: "amber",
    disabled: true,
  },
];

const currencies = [
  { value: PaymentCurrency.USD, label: "USD ($)", symbol: "$" },
  { value: PaymentCurrency.LBP, label: "LBP (ل.ل)", symbol: "ل.ل" },
  { value: PaymentCurrency.AED, label: "AED (د.إ)", symbol: "د.إ" },
];

export default function AgentPricingPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const router = useRouter();

  const { data: agent, isLoading } = useAgent(agentId);
  const updateAgent = useUpdateAgent();

  const [pricingType, setPricingType] = useState<PricingType>(PricingType.FREE);
  const [pricePerMessage, setPricePerMessage] = useState<number>(0);
  const [pricePerConversation, setPricePerConversation] = useState<number>(0);
  const [currency, setCurrency] = useState<PaymentCurrency>(
    PaymentCurrency.USD
  );
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize form with agent data
  useEffect(() => {
    if (agent) {
      if (agent.isFree) {
        setPricingType(PricingType.FREE);
      } else if (agent.pricePerMessage > 0) {
        setPricingType(PricingType.PER_MESSAGE);
      } else if (agent.pricePerConversation > 0) {
        setPricingType(PricingType.PER_CONVERSATION);
      }
      setPricePerMessage(agent.pricePerMessage || 0);
      setPricePerConversation(agent.pricePerConversation || 0);
    }
  }, [agent]);

  const handlePricingTypeChange = (type: PricingType) => {
    setPricingType(type);
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handlePriceChange = (
    field: "message" | "conversation",
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    if (field === "message") {
      setPricePerMessage(numValue);
    } else {
      setPricePerConversation(numValue);
    }
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      const updateData = {
        isFree: pricingType === PricingType.FREE,
        pricePerMessage:
          pricingType === PricingType.PER_MESSAGE ? pricePerMessage : 0,
        pricePerConversation:
          pricingType === PricingType.PER_CONVERSATION
            ? pricePerConversation
            : 0,
      };

      await updateAgent.mutateAsync({ id: agentId, data: updateData });
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update pricing:", error);
    }
  };

  const selectedCurrency = currencies.find((c) => c.value === currency);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Agent not found
          </h1>
          <Link
            href="/creator/agents"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            Back to Agents
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/creator/agents/${agentId}/edit`}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Edit Agent
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Pricing Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure how users pay to access {agent.name}
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!hasChanges || updateAgent.isPending}
            className={`
              inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
              ${
                hasChanges
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {updateAgent.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveSuccess ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Pricing Type Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Pricing Model
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pricingOptions.map((option) => {
            const isSelected = pricingType === option.type;
            const colorClasses = {
              emerald: {
                bg: "bg-emerald-50 dark:bg-emerald-900/20",
                border: "border-emerald-500",
                icon: "text-emerald-500",
              },
              blue: {
                bg: "bg-blue-50 dark:bg-blue-900/20",
                border: "border-blue-500",
                icon: "text-blue-500",
              },
              purple: {
                bg: "bg-purple-50 dark:bg-purple-900/20",
                border: "border-purple-500",
                icon: "text-purple-500",
              },
              amber: {
                bg: "bg-amber-50 dark:bg-amber-900/20",
                border: "border-amber-500",
                icon: "text-amber-500",
              },
            };
            const colors =
              colorClasses[option.color as keyof typeof colorClasses];

            return (
              <button
                key={option.type}
                onClick={() =>
                  !option.disabled && handlePricingTypeChange(option.type)
                }
                disabled={option.disabled}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all
                  ${
                    option.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-md"
                  }
                  ${
                    isSelected
                      ? `${colors.bg} ${colors.border}`
                      : "border-gray-200 dark:border-gray-700"
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isSelected ? colors.bg : "bg-gray-100 dark:bg-gray-700"}
                  `}
                  >
                    <option.icon
                      className={`w-5 h-5 ${
                        isSelected
                          ? colors.icon
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {option.title}
                      </h3>
                      {option.disabled && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {option.description}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className={`w-5 h-5 ${colors.icon}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Price Configuration */}
      {pricingType !== PricingType.FREE && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Price Configuration
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Currency Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value as PaymentCurrency);
                  setHasChanges(true);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {currencies.map((curr) => (
                  <option key={curr.value} value={curr.value}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {pricingType === PricingType.PER_MESSAGE
                  ? "Price per Message"
                  : "Price per Conversation"}
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">
                  {selectedCurrency?.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    pricingType === PricingType.PER_MESSAGE
                      ? pricePerMessage
                      : pricePerConversation
                  }
                  onChange={(e) =>
                    handlePriceChange(
                      pricingType === PricingType.PER_MESSAGE
                        ? "message"
                        : "conversation",
                      e.target.value
                    )
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                {pricingType === PricingType.PER_MESSAGE ? (
                  <p>
                    Users will be charged{" "}
                    <strong>
                      {selectedCurrency?.symbol}
                      {pricePerMessage.toFixed(2)}
                    </strong>{" "}
                    for each message they send to this agent.
                  </p>
                ) : (
                  <p>
                    Users will pay{" "}
                    <strong>
                      {selectedCurrency?.symbol}
                      {pricePerConversation.toFixed(2)}
                    </strong>{" "}
                    once to unlock unlimited access to this agent.
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Preview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Preview
        </h2>

        <div className="max-w-sm mx-auto">
          <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/10 dark:from-purple-600/20 dark:to-cyan-600/20 rounded-xl border border-purple-200 dark:border-purple-500/30 p-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {agent.name}
              </h3>
            </div>

            <div className="border-t border-purple-200 dark:border-purple-500/30 pt-4">
              {pricingType === PricingType.FREE ? (
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    Free
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Unlimited access
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {selectedCurrency?.symbol}
                    {pricingType === PricingType.PER_MESSAGE
                      ? pricePerMessage.toFixed(2)
                      : pricePerConversation.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pricingType === PricingType.PER_MESSAGE
                      ? "per message"
                      : "one-time payment"}
                  </p>
                </div>
              )}
            </div>

            <button className="w-full mt-4 py-3 px-4 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors">
              {pricingType === PricingType.FREE
                ? "Start Chatting"
                : "Unlock Access"}
            </button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>AI-powered responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>RAG-enhanced answers</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>
                  {pricingType === PricingType.FREE
                    ? "Unlimited conversations"
                    : "Premium knowledge base"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
