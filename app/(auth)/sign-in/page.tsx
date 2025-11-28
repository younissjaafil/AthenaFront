import Link from "next/link";

export default function SignInPage() {
  return (
    <div>
      <h2 className="heading-2 mb-6 text-center">Welcome back</h2>

      {/* Clerk SignIn component will go here */}
      <div className="space-y-4">
        <input type="email" placeholder="Email address" className="input" />
        <input type="password" placeholder="Password" className="input" />
        <button className="btn-primary w-full">Sign In</button>
      </div>

      <div className="mt-6 text-center">
        <p className="small-text">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="text-brand-purple-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
