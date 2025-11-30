"use client";

import { ReactNode, useState } from "react";
import { useAgentAccessInfo } from "@/hooks/usePayments";
import { PaywallModal, PaywallCard } from "./PaywallModal";
import { Loader2 } from "lucide-react";

interface EntitlementGuardProps {
  agentId: string;
  agent: {
    id: string;
    name: string;
    description?: string;
    pricePerMessage: number;
    pricePerConversation: number;
    isFree: boolean;
    profileImageUrl?: string;
    creator?: {
      title?: string;
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
  children: ReactNode;
  mode?: "modal" | "inline" | "redirect";
}

export function EntitlementGuard({
  agentId,
  agent,
  children,
  mode = "inline",
}: EntitlementGuardProps) {
  const { hasAccess, isLoading, needsPayment, requiresSignIn } =
    useAgentAccessInfo(agentId, agent.isFree);
  const [showPaywall, setShowPaywall] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-gray-600 dark:text-slate-400">
            Checking access...
          </p>
        </div>
      </div>
    );
  }

  // Has access - render children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Requires sign in
  if (requiresSignIn) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Please sign in to access this agent
        </p>
        <a
          href={`/sign-in?redirect_url=/explore/agents/${agentId}`}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  // Needs payment - show paywall based on mode
  if (needsPayment) {
    if (mode === "modal") {
      return (
        <>
          <button
            onClick={() => setShowPaywall(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium transition-all"
          >
            Unlock Access
          </button>
          <PaywallModal
            isOpen={showPaywall}
            onClose={() => setShowPaywall(false)}
            agent={agent}
          />
        </>
      );
    }

    // Inline mode
    return (
      <>
        <PaywallCard agent={agent} onUnlock={() => setShowPaywall(true)} />
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          agent={agent}
        />
      </>
    );
  }

  // Fallback
  return <>{children}</>;
}
