"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useState } from "react";
import { ThemeProvider, useTheme } from "./theme-provider";

function ClerkProviderWithTheme({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <ClerkProvider
      appearance={{
        baseTheme: theme === "dark" ? dark : undefined,
        variables: {
          colorPrimary: "#9333ea", // brand-purple-600
          colorTextOnPrimaryBackground: "#ffffff",
        },
        elements: {
          card: "bg-white dark:bg-gray-900",
          headerTitle: "text-gray-900 dark:text-gray-100",
          headerSubtitle: "text-gray-600 dark:text-gray-400",
          socialButtonsBlockButton:
            "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
          formFieldLabel: "text-gray-700 dark:text-gray-300",
          formFieldInput:
            "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
          footerActionText: "text-gray-600 dark:text-gray-400",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            // Disable queries during build/prerender
            enabled: typeof window !== "undefined",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ClerkProviderWithTheme>{children}</ClerkProviderWithTheme>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
