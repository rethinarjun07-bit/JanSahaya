"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Zap, Building2, Users, Lock, ArrowRight, Flame } from "lucide-react";

const ROLES = [
  {
    key: "citizen",
    href: "/login/citizen",
    icon: Users,
    emoji: "👤",
    title: "Citizen",
    subtitle: "Community Volunteer",
    desc: "Report ground disasters, track your community's challenges, upvote issues.",
    color: "from-emerald-600 to-teal-700",
    border: "border-emerald-500/40",
    bg: "bg-emerald-950/30",
    text: "text-emerald-300",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  {
    key: "solver",
    href: "/login/solver",
    icon: Zap,
    emoji: "🔬",
    title: "University / Researcher",
    subtitle: "Solver & Innovator",
    desc: "Submit research proposals, track milestones, collaborate with institutes.",
    color: "from-blue-600 to-indigo-700",
    border: "border-blue-500/40",
    bg: "bg-blue-950/30",
    text: "text-blue-300",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  {
    key: "industry",
    href: "/login/industry",
    icon: Building2,
    emoji: "🏭",
    title: "Industry / CSR",
    subtitle: "Corporate Partner",
    desc: "Sponsor pilots, endorse solutions, mentor research teams and track impact.",
    color: "from-purple-600 to-violet-700",
    border: "border-purple-500/40",
    bg: "bg-purple-950/30",
    text: "text-purple-300",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  {
    key: "admin",
    href: "/login/admin",
    icon: ShieldAlert,
    emoji: "🏛️",
    title: "Government Authority",
    subtitle: "Nodal Officer / IAS",
    desc: "Verify challenges, assign universities, merge duplicates, view audit logs.",
    color: "from-amber-600 to-orange-700",
    border: "border-amber-500/40",
    bg: "bg-amber-950/20",
    text: "text-amber-300",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    restricted: true,
  },
];

function LoginLandingInner() {
  const searchParams = useSearchParams();
  const required = searchParams.get("required");

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gov-navy/10 border border-gov-navy/20 text-gov-navy text-xs font-bold mb-4">
            <Flame className="w-3.5 h-3.5 text-gov-saffron" />
            JanSamadhan — National Disaster Mitigation Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif mb-3">
            Select Your Portal
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Sign in to your dedicated workspace. Each stakeholder has a tailored experience built for their role in the disaster management ecosystem.
          </p>

          {required && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              Access to that area requires a <strong>{required}</strong> account — choose the right portal below.
            </div>
          )}
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ROLES.map((role) => {
            const Icon = role.icon;
            const isHighlighted = required === role.key.toUpperCase() ||
              (required === "ADMIN" && role.key === "admin") ||
              (required === "SOLVER" && role.key === "solver") ||
              (required === "INDUSTRY" && role.key === "industry") ||
              (required === "CITIZEN" && role.key === "citizen");

            return (
              <Link
                key={role.key}
                href={role.href}
                className={`group relative flex flex-col p-6 rounded-3xl border-2 bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isHighlighted ? "border-gov-saffron ring-2 ring-gov-saffron/30" : "border-slate-200 hover:border-slate-300"
                  }`}
              >
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gov-saffron text-white text-[10px] font-bold uppercase tracking-wider">
                    Required
                  </div>
                )}

                {/* Icon */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Badge */}
                {role.restricted && (
                  <div className="flex items-center gap-1 mb-2">
                    <Lock className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Govt. Credentials Required</span>
                  </div>
                )}

                <div className="text-lg font-extrabold text-slate-900 leading-tight mb-0.5">
                  {role.emoji} {role.title}
                </div>
                <div className="text-[11px] font-semibold text-slate-500 mb-3">{role.subtitle}</div>
                <p className="text-xs text-slate-500 leading-relaxed flex-1">{role.desc}</p>

                <div className={`mt-4 flex items-center gap-1.5 text-xs font-bold ${role.text} group-hover:gap-2.5 transition-all`}>
                  <span>Enter Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-slate-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-gov-navy hover:underline">Register here →</Link>
          {" · "}
          <span>Govt. of Jharkhand · SDMA · SIH26043</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginLandingInner />
    </Suspense>
  );
}
