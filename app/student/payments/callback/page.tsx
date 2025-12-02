"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { paymentKeys, useSyncAllPending } from "@/hooks/usePayments";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const syncAllPending = useSyncAllPending();

  const status = searchParams.get("status") || searchParams.get("payment");
  const agentId = searchParams.get("agentId");
  const sessionId = searchParams.get("sessionId");
  const transactionId = searchParams.get("transactionId");

  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"syncing" | "done" | "error">(
    "syncing"
  );
  const [syncResult, setSyncResult] = useState<{
    synced: number;
    updated: number;
  } | null>(null);

  useEffect(() => {
    // Only sync if payment was successful
    if (status !== "success") {
      setIsLoading(false);
      return;
    }

    // Sync all pending payments with Whish API
    // This ensures entitlements are granted even if callback failed
    const syncPayments = async () => {
      try {
        setSyncStatus("syncing");
        const result = await syncAllPending.mutateAsync();
        setSyncResult(result);
        setSyncStatus("done");

        // Wait a moment for backend to complete entitlement creation
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Invalidate payment-related queries AFTER sync completes
        await queryClient.invalidateQueries({
          queryKey: paymentKeys.entitlements,
        });
        await queryClient.invalidateQueries({
          queryKey: paymentKeys.transactions,
        });
        if (agentId) {
          await queryClient.invalidateQueries({
            queryKey: paymentKeys.agentAccess(agentId),
          });
        }
        // Invalidate session queries if this was a session payment
        if (sessionId) {
          await queryClient.invalidateQueries({ queryKey: ["sessions"] });
          await queryClient.invalidateQueries({
            queryKey: ["sessions", sessionId],
          });
        }

        // Show success message for 5 seconds, then redirect directly to agent/session
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Redirect directly to agent or session page
        if (agentId) {
          router.push(`/explore/agents/${agentId}`);
        } else if (sessionId) {
          router.push(`/student/sessions/${sessionId}`);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to sync payments:", error);
        setSyncStatus("error");
        setIsLoading(false);
      }
    };

    syncPayments();
  }, [queryClient, agentId, sessionId, syncAllPending, status, router]);

  const isSuccess = status === "success";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {syncStatus === "syncing"
                ? "Verifying payment..."
                : syncStatus === "done"
                ? "Payment verified!"
                : syncStatus === "error"
                ? "Verification failed"
                : "Processing..."}
            </p>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              {syncStatus === "syncing"
                ? "Checking payment status with our payment provider..."
                : syncStatus === "done"
                ? syncResult && syncResult.updated > 0
                  ? `Access granted! Redirecting you to ${
                      agentId ? "the agent" : "your session"
                    }...`
                  : `Access granted! Redirecting you to ${
                      agentId ? "the agent" : "your session"
                    }...`
                : syncStatus === "error"
                ? "Please contact support if this persists"
                : "Please wait..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-xl overflow-hidden">
          {/* Status Header */}
          <div
            className={`p-8 text-center ${
              isSuccess
                ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                : "bg-gradient-to-br from-red-500 to-rose-600"
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
            >
              {isSuccess ? (
                <CheckCircle2 className="w-12 h-12 text-white" />
              ) : (
                <XCircle className="w-12 h-12 text-white" />
              )}
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              {isSuccess ? "Payment Successful!" : "Payment Failed"}
            </h1>
            <p className="text-white/80">
              {isSuccess
                ? sessionId
                  ? "Your session has been confirmed"
                  : "Your access has been unlocked"
                : "Something went wrong with your payment"}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            {isSuccess ? (
              <>
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">
                        {sessionId
                          ? "Session payment complete"
                          : "Premium access granted"}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-500">
                        {sessionId
                          ? "You can now access the meeting link"
                          : "You can now chat with this agent"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {sessionId && (
                    <Link
                      href={`/student/sessions/${sessionId}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      View Session Details
                    </Link>
                  )}
                  {agentId && (
                    <Link
                      href={`/explore/agents/${agentId}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium transition-all"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Start Chatting
                    </Link>
                  )}

                  <Link
                    href="/student/dashboard"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium transition-colors"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                  <p className="text-sm text-red-700 dark:text-red-400">
                    Your payment could not be processed. No charges have been
                    made to your account. Please try again or contact support if
                    the issue persists.
                  </p>
                </div>

                <div className="space-y-3">
                  {sessionId && (
                    <Link
                      href={`/student/sessions/${sessionId}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                    >
                      Try Again
                    </Link>
                  )}
                  {agentId && (
                    <Link
                      href={`/explore/agents/${agentId}`}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
                    >
                      Try Again
                    </Link>
                  )}

                  <Link
                    href={sessionId ? "/student/sessions" : "/explore/agents"}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium transition-colors"
                  >
                    {sessionId ? "View All Sessions" : "Browse Other Agents"}
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-slate-700/30 border-t border-gray-200 dark:border-slate-700">
            <Link
              href="/student/payments"
              className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-500 dark:hover:text-purple-300 flex items-center justify-center gap-1"
            >
              View Payment History
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
