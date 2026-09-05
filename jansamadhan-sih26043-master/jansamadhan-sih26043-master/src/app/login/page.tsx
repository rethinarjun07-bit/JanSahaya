"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldAlert, LogIn, Sparkles, ArrowRight, Lock, AlertTriangle } from "lucide-react";
import { sound } from "@/lib/sound";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// Role-specific messaging when redirected from a protected route
const ROLE_MESSAGES: Record<string, { title: string; desc: string; color: string }> = {
  ADMIN: {
    title: "🏛️ Government Authority Login Required",
    desc: "This area is restricted to empaneled State Nodal Officers and District Magistrates. Please sign in with your official government credentials.",
    color: "border-amber-500/40 bg-amber-950/30 text-amber-300",
  },
  SOLVER: {
    title: "🔬 Researcher / Solver Login Required",
    desc: "The Solver workspace requires a verified researcher account. Please sign in with your institutional credentials.",
    color: "border-blue-500/40 bg-blue-950/30 text-blue-300",
  },
  INDUSTRY: {
    title: "🏭 Industry Partner Login Required",
    desc: "The Industry portal is reserved for registered CSR and industry partners. Please sign in with your organization account.",
    color: "border-purple-500/40 bg-purple-950/30 text-purple-300",
  },
};

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Read context from query params set by middleware redirect
  const required = searchParams.get("required");       // e.g. "ADMIN"
  const from = searchParams.get("from");               // original path
  const isExpired = searchParams.get("expired") === "1";
  const isUnauthorized = searchParams.get("unauthorized") === "1";
  const currentRole = searchParams.get("currentRole");

  const roleMsg = required ? ROLE_MESSAGES[required] : null;

  // Pre-fill placeholder hint for ADMIN
  useEffect(() => {
    if (required === "ADMIN") setEmail("admin@demo.in");
  }, [required]);

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
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      sound.playCelebration();

      // Redirect back to the originally requested page if available
      if (from && from !== "/login") {
        router.push(from);
      } else if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else if (data.user.role === "SOLVER") {
        router.push("/solver/dashboard");
      } else if (data.user.role === "INDUSTRY") {
        router.push("/industry");
      } else {
        router.push("/challenges");
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
      sound.playAlert();
    } finally {
      setLoading(false);
    }
  };

  // Demo quick-login (CITIZEN/SOLVER/INDUSTRY only — no ADMIN)
  const handleQuickLogin = async (role: string) => {
    sound.playClick();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/quick-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Quick login failed");
      }

      sound.playCelebration();
      if (data.user.role === "SOLVER") router.push("/solver/dashboard");
      else if (data.user.role === "INDUSTRY") router.push("/industry");
      else router.push("/challenges");

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error switching role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

        {/* Left Side: Demo Personas (only shown when DEMO_MODE is enabled) */}
        <div className="bg-gradient-to-br from-gov-navy via-slate-900 to-slate-950 p-6 sm:p-8 text-white flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart India Hackathon Evaluator Panel</span>
            </div>

            {DEMO_MODE ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold font-serif mb-2">
                  Demo Login
                </h2>
                <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                  Experience JanSahaya as each stakeholder. Admin requires official credentials.
                </p>

                <div className="space-y-3">
                  {/* Solver */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("SOLVER")}
                    disabled={loading}
                    className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                        <span>🔬 University Researcher</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-blue-400/20 text-blue-200 rounded font-normal">SOLVER</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Dr. Aarav Mehta &bull; BIT Mesra</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Citizen */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("CITIZEN")}
                    disabled={loading}
                    className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <span>👤 Community Citizen</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-emerald-400/20 text-emerald-200 rounded font-normal">CITIZEN</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Priya Sharma &bull; Morabadi, Ranchi</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Industry */}
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("INDUSTRY")}
                    disabled={loading}
                    className="w-full p-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-left transition-all group flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <span>🏭 Industry CSR Partner</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-purple-400/20 text-purple-200 rounded font-normal">INDUSTRY</span>
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">Tata Steel CSR Foundation &bull; Jamshedpur</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-300 group-hover:translate-x-0.5 transition-all" />
                  </button>

                  {/* Admin — requires real credentials */}
                  <div className="w-full p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-left flex items-center gap-3">
                    <Lock className="w-4 h-4 text-red-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        🏛️ Govt. Nodal Officer
                        <span className="text-[10px] px-1.5 py-0.2 bg-red-900/50 text-red-300 rounded font-normal border border-red-700/40">ADMIN</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Requires official credentials → use the login form
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Non-demo: just informational panel */
              <div className="flex flex-col gap-4 mt-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif">
                  JanSamadhan Portal
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The National Societal Innovation &amp; Disaster Mitigation Portal connects
                  citizens, researchers, industry partners, and government authorities to
                  collaboratively solve Jharkhand&apos;s ground challenges.
                </p>
                <div className="space-y-2 text-xs text-slate-400 mt-2">
                  <div>👤 <strong className="text-slate-300">Citizens</strong> — Report ground challenges</div>
                  <div>🔬 <strong className="text-slate-300">Solvers</strong> — Propose research solutions</div>
                  <div>🏭 <strong className="text-slate-300">Industry</strong> — Sponsor and endorse</div>
                  <div>🏛️ <strong className="text-slate-300">Govt. Officers</strong> — Verify and certify</div>
                </div>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-400 pt-6 mt-6 border-t border-white/10">
            Govt. of Jharkhand &bull; Disaster Management Cell SIH26043
          </div>
        </div>

        {/* Right Side: Standard Login Form */}
        <div className="p-6 sm:p-8 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-gov-navy font-bold text-xl mb-1 font-serif">
            <ShieldAlert className="w-6 h-6 text-gov-saffron" />
            <span>Sign In to JanSahaya</span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Enter your credentials to access your personalized workspace.
          </p>

          {/* Context message when redirected from a protected page */}
          {roleMsg && (
            <div className={`p-3 rounded-xl border text-xs font-semibold mb-4 ${roleMsg.color}`}>
              <div className="font-bold mb-0.5">{roleMsg.title}</div>
              <div className="font-normal opacity-90">{roleMsg.desc}</div>
            </div>
          )}

          {/* Session expired warning */}
          {isExpired && (
            <div className="p-3 rounded-xl border border-orange-500/40 bg-orange-950/20 text-orange-300 text-xs mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              Your session has expired. Please sign in again.
            </div>
          )}

          {/* Insufficient role warning */}
          {isUnauthorized && currentRole && (
            <div className="p-3 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-xs mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              Your current role ({currentRole}) does not have access to this area.
              Please sign in with an account that has {required} privileges.
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={required === "ADMIN" ? "admin@demo.in" : "your@email.com"}
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {required === "ADMIN" && (
                  <span className="text-[11px] text-amber-600 font-semibold">Admin@123 (demo)</span>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gov-navy hover:bg-gov-navyLight text-white font-bold text-sm rounded-xl shadow transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? "Authenticating..." : "Sign In"}</span>
            </button>
          </form>

          <div className="text-center mt-6 text-xs text-slate-500">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-gov-navy hover:underline">
              Register here &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
