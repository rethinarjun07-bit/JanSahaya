"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  Building2,
  Award,
  Sparkles,
  CheckCircle2,
  Flame,
  ArrowRight,
  PlusCircle,
  Users,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { computeSolverMatch, SolverProfile, ChallengeTarget } from "@/lib/nlp/matcher";
import { sound } from "@/lib/sound";
import { PagePop, PopItem, PopCard } from "@/components/page-pop-transition";

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  solver: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  challenges: any[];
}

export function SolverDashboardClient({ solver, challenges }: Props) {
  const [activeTab, setActiveTab] = useState<"matched" | "proposals" | "team">("matched");

  const solverSkills: string[] = solver?.skills ? JSON.parse(solver.skills) : [];
  const solverBadges = solver?.badges ? JSON.parse(solver.badges) : [];

  const solverProfile: SolverProfile = {
    id: solver?.id || "demo-solver",
    name: solver?.name || "Dr. Aarav Mehta",
    organization: solver?.organization || "Birla Institute of Technology, Mesra",
    designation: solver?.designation || "Associate Professor",
    skills: solverSkills,
    district: solver?.district || "Ranchi",
    state: solver?.state || "Jharkhand",
    karmaPoints: solver?.karmaPoints || 640,
    solvedCount: solver?.solutions?.length || 2,
  };

  // Compute live match scores for all challenges
  const matchedChallenges = challenges
    .map((c) => {
      const challengeTarget: ChallengeTarget = {
        id: c.id,
        title: c.title,
        category: c.category,
        district: c.district,
        state: c.state,
        aiTags: c.aiTags || [],
        description: c.description,
        urgencyScore: c.urgencyScore,
      };
      const match = computeSolverMatch(solverProfile, challengeTarget);
      return { challenge: c, match };
    })
    .sort((a, b) => b.match.matchPercentage - a.match.matchPercentage);

  return (
    <PagePop className="space-y-6">
      {/* Solver Profile Header Card */}
      <PopItem delay={0.05} className="bg-gradient-to-br from-slate-900 via-gov-navy to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Verified Innovation Research Lab &bull; SIH26043</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif">{solverProfile.name}</h1>

            <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{solverProfile.designation}</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> {solverProfile.organization}
              </span>
              <span>&bull;</span>
              <span>{solverProfile.district}, {solverProfile.state}</span>
            </p>

            {/* Skills Pills */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {solverSkills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-0.5 rounded-lg bg-white/10 text-slate-200 text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="text-right flex flex-col items-end gap-2">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[120px]">
              <div className="text-[10px] uppercase font-bold text-amber-300 tracking-wider">Karma Score</div>
              <div className="text-2xl font-extrabold text-white flex items-center justify-center gap-1">
                ⭐ {solverProfile.karmaPoints}
              </div>
            </div>

            {solverBadges.length > 0 && (
              <div className="flex items-center gap-1.5">
                {solverBadges.map((b: { id: string; name: string }, i: number) => (
                  <span
                    key={i}
                    title={b.name}
                    className="px-2.5 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-lg text-[10px] font-bold"
                  >
                    🏆 {b.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopItem>

      {/* Navigation Tabs */}
      <PopItem delay={0.1} className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab("matched");
          }}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "matched"
              ? "border-b-2 border-gov-navy text-gov-navy"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Matched Ground Challenges ({matchedChallenges.length})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab("proposals");
          }}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "proposals"
              ? "border-b-2 border-gov-navy text-gov-navy"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Award className="w-4 h-4 text-gov-navy" />
          <span>My Submitted Proposals ({solver?.solutions?.length || 0})</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setActiveTab("team");
          }}
          className={`pb-3 px-3 transition-colors flex items-center gap-1.5 ${
            activeTab === "team"
              ? "border-b-2 border-gov-navy text-gov-navy"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4 text-emerald-600" />
          <span>Research Squad & Team Formation</span>
        </button>
      </PopItem>

      {/* TAB 1: Matched Feed */}
      {activeTab === "matched" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Ranked by multi-factor expertise fit against your research domains, geographic proximity, and laboratory credentials.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matchedChallenges.map(({ challenge: c, match }, idx) => (
              <PopCard
                key={c.id}
                delay={0.05 * idx}
                className="bg-white rounded-3xl border border-slate-200 hover:border-gov-navyLight/60 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-red-100 text-red-700">
                      {c.severity} PRIORITY
                    </span>

                    {/* Match Score Badge */}
                    <span className="px-3 py-1 rounded-full bg-gov-navy text-white text-xs font-bold shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{match.matchPercentage}% Fit</span>
                    </span>
                  </div>

                  <Link href={`/challenges/${c.id}`} className="block group">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-gov-navy transition-colors mb-1.5 leading-snug">
                      {c.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="space-y-1 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div className="flex justify-between">
                      <span>Domain Match:</span>
                      <strong className="text-slate-800">{match.breakdown.skillRelevance.score}/40 pts</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Proximity ({c.district}):</span>
                      <strong className="text-slate-800">{match.breakdown.districtProximity.score}/25 pts</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 italic pt-1">
                      {match.breakdown.skillRelevance.detail}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{c.district}, {c.state}</span>
                  <Link
                    href={`/challenges/${c.id}`}
                    className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Submit Proposal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </PopCard>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Submitted Proposals */}
      {activeTab === "proposals" && (
        <div className="space-y-4">
          {solver?.solutions?.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-xs text-slate-500 mb-3">You haven&apos;t submitted any solution proposals yet.</p>
              <button
                onClick={() => setActiveTab("matched")}
                className="px-4 py-2 bg-gov-navy text-white text-xs font-bold rounded-xl"
              >
                Browse Matched Ground Challenges &rarr;
              </button>
            </div>
          ) : (
            solver?.solutions?.map((sol: any) => (
              <div key={sol.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {sol.status.replace("_", " ")}
                      </span>
                      {sol.govtEndorsed && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Govt Endorsed
                        </span>
                      )}
                    </div>
                    <Link href={`/solutions/${sol.id}`} className="block group">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-gov-navy transition-colors">
                        {sol.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      For Challenge: <strong>{sol.challenge.title}</strong>
                    </p>
                  </div>

                  <Link
                    href={`/solutions/${sol.id}`}
                    className="px-4 py-2 bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
                  >
                    Open Workspace &rarr;
                  </Link>
                </div>

                {/* Milestones Progress */}
                {sol.milestones.length > 0 && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="font-bold text-slate-800">Stage Gate Milestones:</div>
                    {sol.milestones.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-700">{m.title}</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            m.status === "APPROVED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Team Formation */}
      {activeTab === "team" && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Interdisciplinary Research Squad
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Assemble student innovators, field engineers, and co-investigators from BIT Mesra and partner institutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">Dr. Aarav Mehta</div>
              <div className="text-slate-500">Lead Principal Investigator</div>
              <div className="mt-2 text-[10px] text-gov-navy font-semibold">BIT Mesra &bull; Remote Sensing</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">Team AeroVanguard</div>
              <div className="text-slate-500">Autonomous UAV Drone Team</div>
              <div className="mt-2 text-[10px] text-gov-navy font-semibold">4 Student Researchers</div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-900">Prof. Rajeshwar Rao</div>
              <div className="text-slate-500">Co-Investigator (Civil Siltation)</div>
              <div className="mt-2 text-[10px] text-gov-navy font-semibold">NIT Jamshedpur</div>
            </div>
          </div>
        </div>
      )}
    </PagePop>
  );
}
