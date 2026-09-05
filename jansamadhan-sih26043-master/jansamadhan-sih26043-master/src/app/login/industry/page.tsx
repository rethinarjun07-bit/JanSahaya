"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, LogIn, ArrowRight, TrendingUp, Handshake, AlertTriangle } from "lucide-react";
import { sound } from "@/lib/sound";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function IndustryLoginInner() {
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
      router.push(from && from !== "/login" ? from : "/industry");
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
        body: JSON.stringify({ role: "INDUSTRY" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      sound.playCelebration();
      router.push("/industry");
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
        <div className="bg-gradient-to-br from-purple-700 via-violet-800 to-slate-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-5 shadow-lg">
              <Building2 className="w-7 h-7 text-purple-300" />
            </div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-purple-300 mb-2">Industry & CSR Portal</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif mb-3 leading-tight">
              CSR Impact &amp; Partnership Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Sponsor research pilots, endorse solutions, mentor research teams, and report your CSR impact to stakeholders and government bodies.
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-2"><Handshake className="w-4 h-4 text-purple-400" /> Endorse &amp; sponsor solutions</div>
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-400" /> Track CSR ROI &amp; impact metrics</div>
              <div className="flex items-center gap-2"><ArrowRight className="w-4 h-4 text-purple-400" /> Collaborate with university labs</div>
            </div>

            {/* CSR Partners */}
            <div className="mt-5 p-3 rounded-xl bg-white/10 border border-white/15 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-2">Active Partners</div>
              <div className="grid grid-cols-2 gap-1 text-slate-300">
                <span>🏭 Tata Steel CSR</span>
                <span>🏭 SAIL Bokaro</span>
                <span>🏭 JSPL Foundation</span>
                <span>🏭 HCL Tech</span>
              </div>
            </div>

            {DEMO_MODE && (
              <button onClick={handleDemo} disabled={loading}
                className="mt-5 w-full py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all flex items-center justify-between">
                <span>🏭 Demo: Tata Steel CSR Foundation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="text-[10px] text-slate-400 pt-5 border-t border-white/10">
            Corporate email required · SIH26043
          </div>
        </div>

        {/* Right — Login Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-purple-700" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Industry Sign In</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">Access the CSR partner workspace and impact dashboard.</p>

          {isExpired && (
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Session expired. Please sign in again.
            </div>
          )}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">{error}</div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="csr@tatasteel.com"
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800 text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2">
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In as Industry Partner"}
            </button>
          </form>

          <div className="flex items-center justify-between mt-5 text-xs text-slate-500">
            <Link href="/register" className="font-bold text-purple-700 hover:underline">Create account →</Link>
            <Link href="/login" className="text-slate-400 hover:text-slate-600">← All portals</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IndustryLoginPage() {
  return <Suspense><IndustryLoginInner /></Suspense>;
}
