export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple-50 to-brand-teal-50">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-purple-600">Athena</h1>
          <p className="text-sm text-gray-600 mt-2">
            AI-Powered Learning Platform
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="card shadow-xl">{children}</div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
