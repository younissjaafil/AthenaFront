import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border-light dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
          >
            Athena
          </Link>

          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-brand-purple-600 transition-colors dark:text-gray-300 dark:hover:text-brand-purple-400"
            >
              Home
            </Link>
            <Link
              href="/explore"
              className="text-sm font-medium text-gray-700 hover:text-brand-purple-600 transition-colors dark:text-gray-300 dark:hover:text-brand-purple-400"
            >
              Explore
            </Link>
            <div className="flex items-center gap-3 ml-4">
              <ThemeToggle />
              <Link href="/sign-in" className="btn-ghost text-sm">
                Sign In
              </Link>
              <Link href="/sign-up" className="btn-primary text-sm">
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border-light dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-brand-purple-600 dark:text-brand-purple-400 mb-4">
                Athena
              </h3>
              <p className="text-sm text-gray-600">
                AI-powered learning platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Features</li>
                <li>Pricing</li>
                <li>For Students</li>
                <li>For Creators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
