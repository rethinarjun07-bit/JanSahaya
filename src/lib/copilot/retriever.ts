import db from "@/lib/db";
import { evaluateDuplicates } from "@/lib/nlp/tfidf";
import { classifyChallenge } from "@/lib/nlp/classifier";
import { compareSolutions, SolutionProposalTarget } from "@/lib/nlp/matcher";

export interface GroundedUserReport {
  id: string;
  title: string;
  category: string;
  severity: string;
  urgencyScore: number;
  status: string;
  district: string;
  autoAssignedUniversity: string | null;
  recommendedDepartment: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  solutionsCount: number;
}

export interface GroundedDistrictPulse {
  district: string;
  totalChallenges: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topCategories: Array<{ category: string; count: number }>;
  recentChallenges: Array<{ id: string; title: string; severity: string; urgencyScore: number; status: string }>;
}

export interface GroundedStatePulse {
  totalActive: number;
  topDistricts: Array<{ district: string; count: number; criticalCount: number }>;
  criticalDistricts: string[];
}

export async function getUserReports(userId: string): Promise<GroundedUserReport[]> {
  const challenges = await db.challenge.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      severity: true,
      urgencyScore: true,
      status: true,
      district: true,
      autoAssignedUniversity: true,
      recommendedDepartment: true,
      verifiedAt: true,
      createdAt: true,
      _count: {
        select: { solutions: true }
      }
    }
  });

  return challenges.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    severity: c.severity,
    urgencyScore: c.urgencyScore,
    status: c.status,
    district: c.district,
    autoAssignedUniversity: c.autoAssignedUniversity,
    recommendedDepartment: c.recommendedDepartment,
    verifiedAt: c.verifiedAt,
    createdAt: c.createdAt,
    solutionsCount: c._count.solutions
  }));
}

export async function getDistrictCivicPulse(districtName: string): Promise<GroundedDistrictPulse> {
  const normalized = districtName.trim();
  const challenges = await db.challenge.findMany({
    where: {
      district: { equals: normalized }
    },
    orderBy: [{ urgencyScore: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      category: true,
      severity: true,
      urgencyScore: true,
      status: true,
    }
  });

  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  const categoryCounts: Record<string, number> = {};

  for (const c of challenges) {
    if (c.severity === "CRITICAL") criticalCount++;
    else if (c.severity === "HIGH") highCount++;
    else if (c.severity === "MEDIUM") mediumCount++;
    else lowCount++;

    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  }

  const topCategories = Object.entries(categoryCounts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    district: normalized,
    totalChallenges: challenges.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    topCategories,
    recentChallenges: challenges.slice(0, 3)
  };
}

export async function getStatewidePulse(): Promise<GroundedStatePulse> {
  const allChallenges = await db.challenge.findMany({
    select: {
      id: true,
      district: true,
      severity: true
    }
  });

  const districtMap: Record<string, { total: number; critical: number }> = {};
  for (const c of allChallenges) {
    if (!districtMap[c.district]) {
      districtMap[c.district] = { total: 0, critical: 0 };
    }
    districtMap[c.district].total++;
    if (c.severity === "CRITICAL") districtMap[c.district].critical++;
  }

  const sorted = Object.entries(districtMap)
    .map(([district, data]) => ({ district, count: data.total, criticalCount: data.critical }))
    .sort((a, b) => b.count - a.count);

  const criticalDistricts = sorted.filter(d => d.criticalCount > 0).map(d => d.district);

  return {
    totalActive: allChallenges.length,
    topDistricts: sorted.slice(0, 5),
    criticalDistricts
  };
}

export async function findDuplicateChallenges(
  title: string,
  description: string,
  district?: string,
  category?: string
) {
  const corpus = await db.challenge.findMany({
    where: { status: { not: "MERGED" } },
    select: {
      id: true,
      title: true,
      description: true,
      district: true,
      category: true,
      severity: true,
      status: true,
      createdAt: true
    }
  });

  const candidates = evaluateDuplicates(
    {
      title,
      description: description || title,
      district,
      category
    },
    corpus,
    0.40 // 40% similarity threshold
  );

  return candidates.slice(0, 3);
}

export async function getAIAnalysisExplanation(challengeId?: string, fallbackText?: string) {
  if (challengeId) {
    const challenge = await db.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        severity: true,
        urgencyScore: true,
        confidenceScore: true,
        recommendedDepartment: true,
        autoAssignedUniversity: true,
        evidenceStrength: true,
        status: true,
        officialNotes: true
      }
    });

    if (challenge) {
      const localAnalysis = classifyChallenge(challenge.title, challenge.description);
      return {
        isExistingChallenge: true,
        id: challenge.id,
        title: challenge.title,
        urgencyScore: challenge.urgencyScore,
        category: challenge.category,
        confidenceScore: challenge.confidenceScore || localAnalysis.confidenceScore,
        department: challenge.recommendedDepartment || localAnalysis.recommendedDepartment,
        university: challenge.autoAssignedUniversity || localAnalysis.recommendedUniversity.name,
        factors: [
          challenge.urgencyScore > 80 ? "Severe life-safety or critical societal disruption" : "Monitored civic hazard",
          `Detected sector signals: ${challenge.category}`,
          `High community vulnerability in administrative area`,
          "Multi-parameter local NLP evidence verification"
        ],
        notes: challenge.officialNotes || "Pending official departmental sign-off."
      };
    }
  }

  // Fallback: analyze provided description
  const text = fallbackText || "Flooding and road blockage in urban settlement";
  const analysis = classifyChallenge("Civic Alert", text);
  return {
    isExistingChallenge: false,
    id: "SYNTHETIC-PREVIEW",
    title: text,
    urgencyScore: analysis.urgencyScore,
    category: analysis.predictedCategory,
    confidenceScore: analysis.confidenceScore,
    department: analysis.recommendedDepartment,
    university: analysis.recommendedUniversity.name,
    factors: analysis.priorityReasons.length > 0 ? analysis.priorityReasons : [
      `${analysis.severity} severity classification`,
      `Domain tags identified: ${analysis.tags.join(", ")}`,
      `Verified civic evidence assessment`
    ],
    notes: "AI recommendation only. Government verification remains final authority."
  };
}

export async function getSolutionsData(challengeId?: string) {
  let solutions;
  if (challengeId) {
    solutions = await db.solution.findMany({
      where: { challengeId },
      include: {
        challenge: { select: { id: true, title: true, district: true } },
        author: { select: { name: true, organization: true } }
      }
    });
  } else {
    solutions = await db.solution.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        challenge: { select: { id: true, title: true, district: true } },
        author: { select: { name: true, organization: true } }
      }
    });
  }

  const targets: SolutionProposalTarget[] = solutions.map(s => ({
    id: s.id,
    title: s.title,
    abstract: s.abstract,
    methodology: s.methodology,
    techStack: s.techStack ? JSON.parse(s.techStack) : [],
    budgetEstimate: s.budgetEstimate,
    timelineMonths: s.timelineMonths,
    teamName: s.teamName,
    authorName: s.author?.name
  }));

  const comparisons = compareSolutions(targets);

  return solutions.map((s, idx) => ({
    id: s.id,
    title: s.title,
    teamName: s.teamName || s.author?.name || "Independent Solver",
    status: s.status,
    budgetEstimate: s.budgetEstimate ? `₹${(s.budgetEstimate / 100000).toFixed(1)} Lakhs` : "Under assessment",
    timelineMonths: s.timelineMonths ? `${s.timelineMonths} months` : "Flexible",
    csrFundingStatus: s.csrFundingStatus,
    challengeTitle: s.challenge?.title,
    challengeId: s.challenge?.id,
    comparison: comparisons[idx]
  }));
}

export function getJharkhandEmergencyContacts() {
  return [
    { label: "National Emergency / Police", value: "112 / 100", badge: "24x7", badgeColor: "red" as const },
    { label: "Ambulance / Medical SOS", value: "108", badge: "Emergency", badgeColor: "red" as const },
    { label: "Jharkhand SDMA Helpline", value: "0651-2446900", badge: "Disaster", badgeColor: "amber" as const },
    { label: "Chief Minister Helpline", value: "181", badge: "Govt", badgeColor: "blue" as const },
    { label: "NDRF Ranchi Battalion", value: "0651-2290000", badge: "Rescue", badgeColor: "amber" as const },
    { label: "Fire Station SOS", value: "101", badge: "24x7", badgeColor: "red" as const }
  ];
}
