import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center">
      <SignUp
        forceRedirectUrl="/explore"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-gray-900 shadow-lg",
            headerTitle: "text-gray-900 dark:text-gray-100",
            headerSubtitle: "text-gray-600 dark:text-gray-400",
            socialButtonsBlockButton:
              "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700",
            socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-200",
            dividerLine: "bg-gray-200 dark:bg-gray-700",
            dividerText: "text-gray-500 dark:text-gray-400",
            formFieldLabel: "text-gray-700 dark:text-gray-300",
            formFieldInput:
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
            formButtonPrimary:
              "bg-brand-purple-600 hover:bg-brand-purple-700 dark:bg-brand-purple-500 dark:hover:bg-brand-purple-600",
            footerActionLink:
              "text-brand-purple-600 dark:text-brand-purple-400 hover:text-brand-purple-700 dark:hover:text-brand-purple-300",
            footerActionText: "text-gray-600 dark:text-gray-400",
            identityPreviewText: "text-gray-700 dark:text-gray-300",
            identityPreviewEditButton:
              "text-brand-purple-600 dark:text-brand-purple-400",
            formFieldInputShowPasswordButton:
              "text-gray-500 dark:text-gray-400",
            otpCodeFieldInput:
              "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100",
          },
        }}
      />
    </div>
  );
}
