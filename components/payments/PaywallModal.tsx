"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCreatePayment } from "@/hooks/usePayments";
import { PaymentCurrency } from "@/lib/types/payment";
import {
  X,
  Lock,
  Crown,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Loader2,
  Shield,
  MessageSquare,
  Zap,
  ExternalLink,
} from "lucide-react";

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: {
    id: string;
    name: string;
    description?: string;
    pricePerMessage: number;
    pricePerConversation: number;
    profileImageUrl?: string;
    creator?: {
      title?: string;
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
}

export function PaywallModal({ isOpen, onClose, agent }: PaywallModalProps) {
  const router = useRouter();
  const createPayment = useCreatePayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine price - prioritize pricePerConversation for one-time access
  const price =
    agent.pricePerConversation > 0
      ? agent.pricePerConversation
      : agent.pricePerMessage;
  const pricingType =
    agent.pricePerConversation > 0 ? "conversation" : "message";

  const creatorName = agent.creator?.user
    ? `${agent.creator.user.firstName || ""} ${
        agent.creator.user.lastName || ""
      }`.trim() || agent.creator.title
    : agent.creator?.title || "Creator";

  const handleUnlock = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createPayment.mutateAsync({
        agentId: agent.id,
        data: {
          amount: price,
          currency: PaymentCurrency.USD,
          invoice: `Unlock access to ${agent.name}`,
          successRedirectUrl: `${window.location.origin}/student/payments/callback?status=success&agentId=${agent.id}`,
          failureRedirectUrl: `${window.location.origin}/student/payments/callback?status=failed&agentId=${agent.id}`,
        },
      });

      // Whish returns collectUrl - redirect user to payment page
      if (result.collectUrl) {
        window.location.href = result.collectUrl;
      } else {
        // No collect URL means something unexpected
        setError("Unable to initiate payment. Please try again.");
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Payment failed:", err);
      setError(
        err?.response?.data?.message ||
          "Payment initiation failed. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const benefits = [
    {
      icon: MessageSquare,
      title:
        pricingType === "conversation" ? "Unlimited Messages" : "Pay As You Go",
      description:
        pricingType === "conversation"
          ? "Chat as much as you want after unlocking"
          : "Only pay for the messages you send",
    },
    {
      icon: Sparkles,
      title: "Premium Knowledge",
      description: "Access creator's curated knowledge base",
    },
    {
      icon: Zap,
      title: "Instant Responses",
      description: "Get AI-powered answers in seconds",
    },
    {
      icon: Shield,
      title: "Secure Payment",
      description: "Your payment info is protected",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-slate-400" />
              </button>

              {/* Header */}
              <div className="relative bg-gradient-to-br from-purple-600 to-cyan-600 px-6 py-8 text-center">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 mb-4"
                >
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  Unlock {agent.name}
                </h2>
                <p className="text-purple-100">
                  Part of {creatorName}&apos;s premium collection
                </p>
              </div>

              {/* Pricing */}
              <div className="px-6 py-6 border-b border-gray-200 dark:border-slate-700">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      ${price.toFixed(2)}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400">
                      {pricingType === "conversation" ? "one-time" : "/message"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mt-2">
                    {pricingType === "conversation"
                      ? "Unlock unlimited access to this agent"
                      : "Pay per message you send"}
                  </p>
                </div>
              </div>

              {/* Benefits */}
              <div className="px-6 py-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  What you get
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={benefit.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                        <benefit.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {benefit.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {benefit.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 py-6 bg-gray-50 dark:bg-slate-800/50">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleUnlock}
                  disabled={isProcessing}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirecting to payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      Pay ${price.toFixed(2)} with Whish
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 dark:text-slate-400 mt-3">
                  You&apos;ll receive an OTP on your phone to confirm payment
                </p>

                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500 dark:text-slate-400">
                  <Shield className="w-3 h-3" />
                  <span>Secure payment powered by Whish</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Inline Paywall Card for embedding in pages
export function PaywallCard({
  agent,
  onUnlock,
}: {
  agent: {
    id: string;
    name: string;
    pricePerMessage: number;
    pricePerConversation: number;
  };
  onUnlock: () => void;
}) {
  const price =
    agent.pricePerConversation > 0
      ? agent.pricePerConversation
      : agent.pricePerMessage;
  const pricingType =
    agent.pricePerConversation > 0 ? "conversation" : "message";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-purple-600/10 to-cyan-600/10 dark:from-purple-600/20 dark:to-cyan-600/20 rounded-2xl border border-purple-200 dark:border-purple-500/30 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/20 mb-4">
          <Lock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Premium Agent
        </h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          This agent is part of the creator&apos;s premium insights. Unlock to
          get full access.
        </p>

        <div className="mb-6">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            ${price.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {pricingType === "conversation"
              ? "one-time payment"
              : "per message"}
          </p>
        </div>

        <button
          onClick={onUnlock}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/20"
        >
          <Crown className="w-5 h-5" />
          Unlock Access
        </button>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant access after payment</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Premium knowledge base</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Secure payment</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
