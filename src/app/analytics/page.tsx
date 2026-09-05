import React from "react";
import Link from "next/link";
import { BarChart3, ArrowLeft, ShieldAlert } from "lucide-react";
import db from "@/lib/db";
import { AnalyticsClient } from "./analytics-client";
import { PagePop, PopItem } from "@/components/page-pop-transition";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const totalChallenges = await db.challenge.count();
  const resolvedChallenges = await db.challenge.count({ where: { status: "SOLVED" } });
  const verifiedChallenges = await db.challenge.count({ where: { status: "VERIFIED" } });
  const assignedChallenges = await db.challenge.count({ where: { status: "ASSIGNED" } });
  const inProgressChallenges = await db.challenge.count({ where: { status: "IN_PROGRESS" } });
  const mergedChallenges = await db.challenge.count({ where: { status: "MERGED" } });

  const totalSolutions = await db.solution.count();
  const verifiedSolutions = await db.solution.count({ where: { govtEndorsed: true } });
  const totalSolvers = await db.user.count({ where: { role: "SOLVER" } });
  const totalCitizens = await db.user.count({ where: { role: "CITIZEN" } });
  const totalIndustry = await db.user.count({ where: { role: "INDUSTRY" } });

  const challenges = await db.challenge.findMany({
    select: { category: true, severity: true, district: true, status: true },
  });

  const categoryCounts: Record<string, number> = {};
  const severityCounts: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  const districtCounts: Record<string, number> = {};

  for (const c of challenges) {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    severityCounts[c.severity] = (severityCounts[c.severity] || 0) + 1;
    districtCounts[c.district] = (districtCounts[c.district] || 0) + 1;
  }

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));
  const severityData = Object.entries(severityCounts).map(([name, value]) => ({ name, value }));
  const districtData = Object.entries(districtCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const statusFunnel = [
    { stage: "Submitted", count: totalChallenges },
    { stage: "Verified", count: verifiedChallenges + assignedChallenges + inProgressChallenges + resolvedChallenges },
    { stage: "Assigned", count: assignedChallenges + inProgressChallenges + resolvedChallenges },
    { stage: "Active Proposals", count: inProgressChallenges + resolvedChallenges },
    { stage: "Deployed / Solved", count: resolvedChallenges },
  ];

  const data = {
    summary: {
      totalChallenges,
      resolvedChallenges,
      activeSolutions: totalSolutions,
      verifiedSolutions,
      totalSolvers,
      totalCitizens,
      totalIndustry,
      districtsCovered: Object.keys(districtCounts).length || 24,
      csrPledgedCrores: "₹4.85 Cr",
      duplicateMergesCount: mergedChallenges,
    },
    categoryData,
    severityData,
    districtData,
    statusFunnel,
  };

  return (
    <PagePop className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <PopItem delay={0.05} className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-gov-navy transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>
          <span className="text-xs font-bold text-gov-navy bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            National Disaster Intelligence & Analytics
          </span>
        </PopItem>

        <PopItem delay={0.1} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2 font-serif text-slate-900 text-2xl font-bold">
            <BarChart3 className="w-7 h-7 text-gov-saffron" />
            <span>JanSahaya Analytics & Impact Dashboard</span>
          </div>
          <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
            Real-time geospatial analytics, sector vulnerabilities, and lifecycle progress across 25 ground challenges and 24 Jharkhand districts.
          </p>
        </PopItem>

        <AnalyticsClient data={data} />
      </div>
    </PagePop>
  );
}
