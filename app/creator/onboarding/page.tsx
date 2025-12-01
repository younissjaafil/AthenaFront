"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bot,
  FileText,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Upload,
  Sparkles,
} from "lucide-react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useBecomeCreator } from "@/hooks/useCreators";

type Step = "profile" | "product" | "preview";

interface ProfileData {
  displayName: string;
  title: string;
  bio: string;
  avatarUrl?: string;
}

interface ProductChoice {
  type: "agent" | "document" | "session" | "skip";
}

export default function CreatorOnboardingPage() {
  const router = useRouter();
  const { data: currentUser } = useCurrentUser();
  const becomeCreator = useBecomeCreator();

  const [currentStep, setCurrentStep] = useState<Step>("profile");
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: currentUser?.firstName
      ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
      : "",
    title: "",
    bio: "",
  });
  const [productChoice, setProductChoice] = useState<ProductChoice>({
    type: "skip",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: { key: Step; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    {
      key: "product",
      label: "First Product",
      icon: <Sparkles className="w-4 h-4" />,
    },
    { key: "preview", label: "Preview", icon: <Check className="w-4 h-4" /> },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  const handleNext = () => {
    if (currentStep === "profile") setCurrentStep("product");
    else if (currentStep === "product") setCurrentStep("preview");
  };

  const handleBack = () => {
    if (currentStep === "product") setCurrentStep("profile");
    else if (currentStep === "preview") setCurrentStep("product");
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Create creator profile
      await becomeCreator.mutateAsync({
        title: profileData.title,
        tagline: profileData.bio,
      });

      // Redirect to creator dashboard or profile
      router.push("/creator/dashboard");
    } catch (error) {
      console.error("Failed to create creator profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (currentStep === "profile") {
      return profileData.displayName.length > 0 && profileData.title.length > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Progress Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Become a Creator
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.key} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    index <= currentStepIndex
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.icon
                  )}
                </div>
                <span
                  className={`ml-2 text-sm font-medium hidden sm:block ${
                    index <= currentStepIndex
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      index < currentStepIndex
                        ? "bg-purple-600"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Profile Basics */}
          {currentStep === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Set up your creator profile
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This is how students will see you on Athena
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-400 to-teal-400 flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.displayName.charAt(0) || "?"}
                  </div>
                  <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        displayName: e.target.value,
                      })
                    }
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Professional Title *
                  </label>
                  <input
                    type="text"
                    value={profileData.title}
                    onChange={(e) =>
                      setProfileData({ ...profileData, title: e.target.value })
                    }
                    placeholder="e.g., Senior AI Engineer at Google"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    One-line Bio
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    placeholder="What makes you unique? What will students learn from you?"
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: First Product */}
          {currentStep === "product" && (
            <motion.div
              key="product"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create your first product
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  What would you like to offer first? You can add more later.
                </p>
              </div>

              <div className="grid gap-4">
                {/* AI Agent */}
                <button
                  onClick={() => setProductChoice({ type: "agent" })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    productChoice.type === "agent"
                      ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        AI Agent
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Create an AI clone that answers questions based on your
                        knowledge
                      </p>
                    </div>
                    {productChoice.type === "agent" && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </button>

                {/* Document */}
                <button
                  onClick={() => setProductChoice({ type: "document" })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    productChoice.type === "document"
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        Premium Document
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Upload guides, templates, or educational materials to
                        sell
                      </p>
                    </div>
                    {productChoice.type === "document" && (
                      <Check className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>

                {/* Session Availability */}
                <button
                  onClick={() => setProductChoice({ type: "session" })}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${
                    productChoice.type === "session"
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        1-on-1 Sessions
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set your availability and hourly rate for consultations
                      </p>
                    </div>
                    {productChoice.type === "session" && (
                      <Check className="w-5 h-5 text-teal-600" />
                    )}
                  </div>
                </button>

                {/* Skip for now */}
                <button
                  onClick={() => setProductChoice({ type: "skip" })}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    productChoice.type === "skip"
                      ? "border-gray-400 bg-gray-100 dark:bg-gray-700"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300"
                  }`}
                >
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Skip for now, I&apos;ll add products later
                  </span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Preview */}
          {currentStep === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Looking good! 🎉
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Here&apos;s how your profile will look to students
                </p>
              </div>

              {/* Profile Preview Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-purple-600 to-teal-500" />

                <div className="p-6 -mt-16">
                  {/* Avatar */}
                  <div className="w-24 h-24 rounded-xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden mb-4">
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 to-teal-400 flex items-center justify-center text-white text-3xl font-bold">
                      {profileData.displayName.charAt(0)}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {profileData.displayName}
                  </h3>
                  <p className="text-purple-600 dark:text-purple-400 mb-2">
                    {profileData.title}
                  </p>
                  {profileData.bio && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {profileData.bio}
                    </p>
                  )}

                  {/* Product Badge */}
                  {productChoice.type !== "skip" && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {productChoice.type === "agent" && (
                        <>
                          <Bot className="w-4 h-4" />
                          <span>AI Agent (will be created next)</span>
                        </>
                      )}
                      {productChoice.type === "document" && (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Document (will be uploaded next)</span>
                        </>
                      )}
                      {productChoice.type === "session" && (
                        <>
                          <Calendar className="w-4 h-4" />
                          <span>Sessions (will configure next)</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                You can customize your profile further after setup
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentStep !== "profile" ? (
            <button
              onClick={handleBack}
              className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep !== "preview" ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                canProceed()
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-teal-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Complete Setup
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
