"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Public Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-border-light dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold text-brand-purple-600 dark:text-brand-purple-400"
          >
            Athena
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
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
              {isSignedIn ? (
                <Link href="/student/dashboard" className="btn-primary text-sm">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="btn-ghost text-sm">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="btn-primary text-sm">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-light dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Home
            </Link>
            <Link
              href="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Explore
            </Link>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {isSignedIn ? (
                <Link
                  href="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center btn-primary text-sm"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center btn-ghost text-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center btn-primary text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-border-light dark:border-gray-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="font-bold text-brand-purple-600 dark:text-brand-purple-400 mb-4">
                Athena
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered learning platform
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Product
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>For Students</li>
                <li>For Creators</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Company
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
