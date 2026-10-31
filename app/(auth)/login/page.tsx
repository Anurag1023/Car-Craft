"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Lock, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred during login");
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword("Password123!");
    setError("");
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-8 shadow-sm border border-slate-200 rounded-2xl">
      {error && (
        <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="email"
              type="email"
              required
              placeholder="admin@carcraft.local"
              className="pl-9"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
          </div>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="password"
              type="password"
              required
              placeholder="••••••••••••"
              className="pl-9"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
          Sign In to CarCraft
        </Button>
      </form>

      {/* Quick Demo Fill Buttons */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2.5">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>One-Click Demo Credentials:</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin("admin@carcraft.local")}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Admin</span>
              <span className="text-[10px] text-blue-600 bg-blue-100 px-1 rounded">Full</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">admin@carcraft.local</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("dealer@carcraft.local")}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Dealer</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-100 px-1 rounded">Apex</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">dealer@carcraft.local</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("customer@carcraft.local")}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Customer</span>
              <span className="text-[10px] text-purple-600 bg-purple-100 px-1 rounded">Buyer</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">customer@carcraft.local</div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin("service@carcraft.local")}
            className="p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-left transition"
          >
            <div className="font-bold text-slate-800 flex items-center justify-between">
              <span>Service Mgr</span>
              <span className="text-[10px] text-amber-600 bg-amber-100 px-1 rounded">Bay</span>
            </div>
            <div className="text-[11px] text-slate-500 truncate">service@carcraft.local</div>
          </button>
        </div>
        <p className="text-[11px] text-slate-500 text-center mt-2.5">
          Default demo password for all accounts: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">Password123!</code>
        </p>
      </div>

      <div className="mt-6 text-center text-xs text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-500">
          Register as Customer
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Car className="h-7 w-7" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">
            Car<span className="text-blue-600">Craft</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-500">
          Choose a role quick-fill or enter your account credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="bg-white p-8 rounded-2xl text-center text-slate-400">Loading sign in...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
