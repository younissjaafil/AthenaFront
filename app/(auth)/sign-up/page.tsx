import Link from "next/link";

export default function SignUpPage() {
  return (
    <div>
      <h2 className="heading-2 mb-6 text-center">Create your account</h2>

      {/* Clerk SignUp component will go here */}
      <div className="space-y-4">
        <input type="text" placeholder="Full name" className="input" />
        <input type="email" placeholder="Email address" className="input" />
        <input type="password" placeholder="Password" className="input" />
        <button className="btn-primary w-full">Create Account</button>
      </div>

      <div className="mt-6 text-center">
        <p className="small-text">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-brand-purple-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
