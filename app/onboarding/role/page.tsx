"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createClientApiClient } from "@/lib/api-client";

export default function OnboardingRolePage() {
  const router = useRouter();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      console.log("Clerk not loaded yet");
      return;
    }

    if (!isSignedIn) {
      console.log("User not signed in, redirecting to sign-in");
      router.push("/sign-in");
      return;
    }

    const checkExistingRole = async () => {
      try {
        console.log("Getting Clerk token...");
        const token = await getToken();
        if (!token) {
          console.error("No token available - user might not be authenticated");
          router.push("/sign-in");
          return;
        }
        console.log("Token retrieved successfully");
        const apiClient = createClientApiClient(() => Promise.resolve(token));

        // Ensure user exists in backend (auto-creates if needed)
        const userResponse = await apiClient.get("/api/users/me");
        const user = userResponse.data;

        // If user has already completed onboarding, redirect to appropriate dashboard
        if (user.hasCompletedOnboarding) {
          // Check if user is admin
          try {
            await apiClient.get("/api/admin/me");
            router.replace("/admin/dashboard");
            return;
          } catch (error: any) {
            // Not admin, continue
          }

          // Check if user is a creator
          try {
            await apiClient.get("/api/creators/me");
            router.replace("/creator/dashboard");
            return;
          } catch (error: any) {
            // Not a creator, must be student
          }

          // Default to student
          router.replace("/student/dashboard");
          return;
        }

        // User hasn't completed onboarding yet
        // Check if they're already admin or creator (edge case)
        try {
          await apiClient.get("/api/admin/me");
          router.replace("/admin/dashboard");
          return;
        } catch (error: any) {
          // Not admin
        }

        try {
          await apiClient.get("/api/creators/me");
          router.replace("/creator/dashboard");
          return;
        } catch (error: any) {
          // Not a creator
        }

        // Show onboarding UI
        setIsChecking(false);
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsChecking(false);
      }
    };

    checkExistingRole();
  }, [isLoaded, isSignedIn, getToken, router]);

  const handleContinueAsStudent = async () => {
    setIsProcessing(true);
    try {
      console.log("Student button clicked");
      const token = await getToken();
      if (!token) {
        console.error("No token available");
        alert("Authentication error: Please sign in again");
        setIsProcessing(false);
        return;
      }
      const apiClient = createClientApiClient(() => Promise.resolve(token));

      // Mark onboarding as complete
      console.log("Calling PATCH /api/users/me...");
      await apiClient.patch("/api/users/me", {
        hasCompletedOnboarding: true,
      });
      console.log("Onboarding marked as complete");

      // Redirect to student dashboard
      console.log("Redirecting to /student/dashboard");
      router.replace("/student/dashboard");
    } catch (error) {
      console.error("Error completing student onboarding:", error);
      alert("Error: " + (error as any).message);
      setIsProcessing(false);
    }
  };

  const handleBecomeCreator = async () => {
    setIsProcessing(true);
    try {
      console.log("Creator button clicked");
      const token = await getToken();
      if (!token) {
        console.error("No token available");
        alert("Authentication error: Please sign in again");
        setIsProcessing(false);
        return;
      }
      const apiClient = createClientApiClient(() => Promise.resolve(token));

      // Create creator profile (backend will auto-set hasCompletedOnboarding)
      console.log("Calling POST /api/creators...");
      await apiClient.post("/api/creators", {
        title: "New Creator",
        bio: "",
      });
      console.log("Creator profile created");

      // Redirect to creator dashboard
      console.log("Redirecting to /creator/dashboard");
      router.replace("/creator/dashboard");
    } catch (error) {
      console.error("Error creating creator profile:", error);
      alert("Error: " + (error as any).message);
      setIsProcessing(false);
    }
  };

  if (isChecking || isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-gray-950">
        <div className="text-center">
          <div className="animate-pulse text-gray-500 dark:text-gray-400 mb-4">
            {isChecking
              ? "Checking your account..."
              : "Setting up your profile..."}
          </div>
          <div className="w-8 h-8 border-4 border-brand-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-gray-950 px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How do you want to use Athena?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose your path. You can change this later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Student Option */}
          <button
            onClick={handleContinueAsStudent}
            disabled={isProcessing}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-left transition-all hover:border-brand-purple-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple-50 dark:bg-brand-purple-950 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-5xl mb-4">🎓</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Continue as Student
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Learn with AI-powered agents created by experts. Chat, ask
                questions, and expand your knowledge.
              </p>
              <div className="mt-6 flex items-center text-brand-purple-600 dark:text-brand-purple-400 font-medium">
                Get started
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>

          {/* Creator Option */}
          <button
            onClick={handleBecomeCreator}
            disabled={isProcessing}
            className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-left transition-all hover:border-brand-teal-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal-50 dark:bg-brand-teal-950 rounded-full -mr-16 -mt-16 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="text-5xl mb-4">🚀</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Become a Creator
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Build and monetize your own AI agents. Share your expertise and
                earn from your knowledge.
              </p>
              <div className="mt-6 flex items-center text-brand-teal-600 dark:text-brand-teal-400 font-medium">
                Start creating
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
