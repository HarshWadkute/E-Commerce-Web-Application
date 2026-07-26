"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-10 space-y-8 bg-white p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 bg-black rounded-full flex items-center justify-center mb-4 shadow-md">
          <LogIn className="h-5 w-5 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-500">Sign in to manage your orders</p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 font-medium">{error}</div>}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              required
              className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              className="block w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-500 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all disabled:opacity-70 active:scale-[0.98]"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign in"}
        </button>
      </form>
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 text-center">
        <p className="font-bold mb-1">Demo Admin Access</p>
        <p>Email: <span className="font-mono">admin123@gmail.com</span></p>
        <p>Password: <span className="font-mono">admin123</span></p>
      </div>

      <p className="text-center text-sm text-gray-500 font-medium mt-6">
        Don't have an account?{" "}
        <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-bold text-black hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-20"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
