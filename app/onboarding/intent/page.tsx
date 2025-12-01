"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GraduationCap, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { useSetIntent } from "@/hooks/useCurrentUser";

export default function IntentPage() {
  const router = useRouter();
  const setIntent = useSetIntent();
  const [selected, setSelected] = useState<"learn" | "earn" | null>(null);

  const handleContinue = async () => {
    if (!selected) return;

    try {
      await setIntent.mutateAsync(selected);

      // Route based on selection
      if (selected === "learn") {
        router.push("/explore");
      } else {
        router.push("/creator/onboarding");
      }
    } catch (error) {
      console.error("Failed to set intent:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <span className="text-4xl font-bold text-white">A</span>
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            What brings you to Athena?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            This helps us personalize your experience
          </p>
        </div>

        {/* Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Learn Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("learn")}
            className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
              selected === "learn"
                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-700"
            }`}
          >
            {selected === "learn" && (
              <motion.div
                layoutId="selected"
                className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-4">
              <GraduationCap className="w-7 h-7 text-purple-600 dark:text-purple-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Learn & Get Help
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Connect with expert creators who can teach you, answer questions,
              and share knowledge.
            </p>

            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Chat with AI agents
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Access premium documents
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                Book 1-on-1 sessions
              </li>
            </ul>
          </motion.button>

          {/* Earn Option */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected("earn")}
            className={`relative p-8 rounded-2xl border-2 text-left transition-all ${
              selected === "earn"
                ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 shadow-lg"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-300 dark:hover:border-teal-700"
            }`}
          >
            {selected === "earn" && (
              <motion.div
                layoutId="selected"
                className="absolute top-4 right-4 w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            )}

            <div className="w-14 h-14 bg-teal-100 dark:bg-teal-900/30 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Share Knowledge & Earn
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Become a creator and monetize your expertise with AI agents,
              documents, and sessions.
            </p>

            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                Create AI clones of yourself
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                Sell premium content
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
                Offer paid consultations
              </li>
            </ul>
          </motion.button>
        </div>

        {/* Continue Button */}
        <motion.button
          whileHover={{ scale: selected ? 1.02 : 1 }}
          whileTap={{ scale: selected ? 0.98 : 1 }}
          onClick={handleContinue}
          disabled={!selected || setIntent.isPending}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 transition-all ${
            selected
              ? "bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg hover:shadow-xl"
              : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          }`}
        >
          {setIntent.isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Skip link */}
        <p className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          You can always change this later in settings
        </p>
      </motion.div>
    </div>
  );
}
