import { NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const totalChallenges = await db.challenge.count();
    const resolvedChallenges = await db.challenge.count({ where: { status: "SOLVED" } });
    const inProgressChallenges = await db.challenge.count({ where: { status: "IN_PROGRESS" } });
    const verifiedChallenges = await db.challenge.count({ where: { status: "VERIFIED" } });
    const assignedChallenges = await db.challenge.count({ where: { status: "ASSIGNED" } });
    const mergedChallenges = await db.challenge.count({ where: { status: "MERGED" } });

    const totalSolutions = await db.solution.count();
    const verifiedSolutions = await db.solution.count({ where: { govtEndorsed: true } });
    const totalSolvers = await db.user.count({ where: { role: "SOLVER" } });
    const totalCitizens = await db.user.count({ where: { role: "CITIZEN" } });
    const totalIndustry = await db.user.count({ where: { role: "INDUSTRY" } });

    // Category Breakdown
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
      { stage: "Verified by Govt", count: verifiedChallenges + assignedChallenges + inProgressChallenges + resolvedChallenges },
      { stage: "Institute Assigned", count: assignedChallenges + inProgressChallenges + resolvedChallenges },
      { stage: "Active Solutions", count: inProgressChallenges + resolvedChallenges },
      { stage: "Deployed & Solved", count: resolvedChallenges },
    ];

    return NextResponse.json({
      summary: {
        totalChallenges,
        resolvedChallenges,
        activeSolutions: totalSolutions,
        verifiedSolutions,
        totalSolvers,
        totalCitizens,
        totalIndustry,
        districtsCovered: Object.keys(districtCounts).length,
        csrPledgedCrores: "₹4.85 Cr",
        duplicateMergesCount: mergedChallenges,
      },
      categoryData,
      severityData,
      districtData,
      statusFunnel,
    });
  } catch (error: unknown) {
    console.error("Analytics API Error:", error);
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 });
  }
}
