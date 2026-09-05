"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, LogIn, ArrowRight, MapPin, Flame, AlertTriangle, Lock } from "lucide-react";
import { sound } from "@/lib/sound";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function CitizenLoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const isExpired = searchParams.get("expired") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      sound.playCelebration();
      router.push(from && from !== "/login" ? from : "/challenges");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
      sound.playAlert();
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    sound.playClick();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "CITIZEN" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sound.playCelebration();
      router.push("/challenges");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-3xl shadow-xl overflow-hidden border border-slate-200 bg-white">

        {/* Left — Identity Panel */}
        <div className="bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5 shadow-lg">
              <Users className="w-7 h-7 text-emerald-300" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-300 mb-2">Citizen Portal</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mb-3 leading-tight">
              Voice of the Community
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Report ground-level disasters, track progress, upvote critical issues, and be part of Jharkhand&apos;s disaster response network.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2"><Flame className="w-4 h-4 text-emerald-400" /> Report disasters in real-time</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Geo-tagged challenge submission</div>
              <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-emerald-400" /> Track your reports &amp; earn karma</div>
            </div>

            {DEMO_MODE && (
              <button
                onClick={handleDemo}
                disabled={loading}
                className="mt-7 w-full py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-between"
              >
                <span>👤 Demo: Try as Priya Sharma (Ranchi)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-400 pt-5 border-t border-white/10">
            Govt. of Jharkhand · SDMA · SIH26043
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Citizen Sign In</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">Sign in to report and track community challenges.</p>

          {isExpired && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Your session expired. Please sign in again.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="priya.sharma@gmail.com"
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In as Citizen"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-5 text-xs text-slate-500">
            <Link href="/register" className="font-bold text-emerald-700 hover:underline">Create account →</Link>
            <Link href="/login" className="text-slate-400 hover:text-slate-600">← All portals</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CitizenLoginPage() {
  return <Suspense><CitizenLoginInner /></Suspense>;
}
