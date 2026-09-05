/**
 * Explainable Solver-Challenge Expertise Matching Engine
 */

export interface SolverProfile {
  id: string;
  name: string;
  organization?: string | null;
  designation?: string | null;
  skills: string[]; // parsed JSON
  district?: string | null;
  state?: string | null;
  karmaPoints?: number;
  solvedCount?: number;
}

export interface ChallengeTarget {
  id: string;
  title: string;
  category: string;
  district: string;
  state: string;
  aiTags: string[];
  description: string;
  urgencyScore?: number;
}

export interface ExplainableMatch {
  solverId: string;
  solverName: string;
  organization: string;
  matchPercentage: number;
  fitVerdict: "PERFECT_MATCH" | "HIGH_ALIGNMENT" | "GOOD_FIT" | "PARTIAL_FIT";
  matchedSkills: string[];
  breakdown: {
    skillRelevance: { score: number; max: 40; detail: string };
    districtProximity: { score: number; max: 25; detail: string };
    institutionalAlignment: { score: number; max: 20; detail: string };
    provenTrackRecord: { score: number; max: 15; detail: string };
  };
}

export function computeSolverMatch(
  solver: SolverProfile,
  challenge: ChallengeTarget
): ExplainableMatch {
  const combinedChallengeText = `${challenge.title} ${challenge.description} ${challenge.category} ${challenge.aiTags.join(" ")}`.toLowerCase();

  // 1. Skill Relevance (Max 40 pts)
  const matchedSkills: string[] = [];
  for (const skill of solver.skills) {
    const sLower = skill.toLowerCase();
    if (
      combinedChallengeText.includes(sLower) ||
      challenge.aiTags.some((t) => t.toLowerCase().includes(sLower) || sLower.includes(t.toLowerCase()))
    ) {
      matchedSkills.push(skill);
    }
  }

  let skillPoints = 0;
  if (solver.skills.length > 0) {
    const ratio = matchedSkills.length / Math.min(solver.skills.length, 4);
    skillPoints = Math.min(40, Math.round(ratio * 38) + (matchedSkills.length > 0 ? 5 : 0));
  } else {
    skillPoints = 12; // baseline
  }

  // 2. District & State Proximity (Max 25 pts)
  let districtPoints = 5;
  let proximityDetail = "Regional coverage within India";
  if (solver.district && solver.district.toLowerCase() === challenge.district.toLowerCase()) {
    districtPoints = 25;
    proximityDetail = `Direct on-ground proximity in ${challenge.district}`;
  } else if (solver.state && solver.state.toLowerCase() === challenge.state.toLowerCase()) {
    districtPoints = 18;
    proximityDetail = `Intra-state proximity within ${challenge.state}`;
  }

  // 3. Institutional Alignment (Max 20 pts)
  let instPoints = 8;
  let instDetail = "Multidisciplinary academic lab";
  const orgLower = (solver.organization || "").toLowerCase();

  if (
    (challenge.category.includes("Mining") || combinedChallengeText.includes("subsidence") || combinedChallengeText.includes("coal")) &&
    (orgLower.includes("iit") || orgLower.includes("dhanbad") || orgLower.includes("ism"))
  ) {
    instPoints = 20;
    instDetail = "Center of Excellence: Mining, Coal & Subterranean Geophysics (IIT ISM)";
  } else if (
    (challenge.category.includes("Disaster") || combinedChallengeText.includes("flood") || combinedChallengeText.includes("drone")) &&
    (orgLower.includes("bit") || orgLower.includes("mesra"))
  ) {
    instPoints = 20;
    instDetail = "Specialized Lab: Remote Sensing, Hydrology & Aerial Disaster Mapping (BIT Mesra)";
  } else if (
    (challenge.category.includes("Agriculture") || combinedChallengeText.includes("drought") || combinedChallengeText.includes("forest")) &&
    (orgLower.includes("birsa") || orgLower.includes("bau"))
  ) {
    instPoints = 20;
    instDetail = "Dedicated Agro-Climatic & Forest Ecology Research Division (BAU)";
  } else if (
    (challenge.category.includes("Infrastructure") || combinedChallengeText.includes("industrial") || combinedChallengeText.includes("effluent")) &&
    (orgLower.includes("nit") || orgLower.includes("jamshedpur"))
  ) {
    instPoints = 20;
    instDetail = "National Heavy Industrial Hazard & Smart Materials Division (NIT JSR)";
  } else if (orgLower.length > 3) {
    instPoints = 14;
    instDetail = `Accredited research affiliation with ${solver.organization}`;
  }

  // 4. Proven Track Record & Karma (Max 15 pts)
  const karma = solver.karmaPoints || 100;
  const karmaPoints = Math.min(15, Math.max(5, Math.round((karma / 500) * 15)));
  const trackDetail = `Karma score ${karma} with ${(solver.solvedCount || 1)} past verified implementations`;

  const totalScore = Math.min(99, skillPoints + districtPoints + instPoints + karmaPoints);

  let fitVerdict: "PERFECT_MATCH" | "HIGH_ALIGNMENT" | "GOOD_FIT" | "PARTIAL_FIT" = "GOOD_FIT";
  if (totalScore >= 85) fitVerdict = "PERFECT_MATCH";
  else if (totalScore >= 72) fitVerdict = "HIGH_ALIGNMENT";
  else if (totalScore >= 58) fitVerdict = "GOOD_FIT";
  else fitVerdict = "PARTIAL_FIT";

  return {
    solverId: solver.id,
    solverName: solver.name,
    organization: solver.organization || "Independent Researcher",
    matchPercentage: totalScore,
    fitVerdict,
    matchedSkills,
    breakdown: {
      skillRelevance: {
        score: skillPoints,
        max: 40,
        detail: matchedSkills.length > 0 ? `Matched domains: ${matchedSkills.join(", ")}` : "General engineering domain fit",
      },
      districtProximity: {
        score: districtPoints,
        max: 25,
        detail: proximityDetail,
      },
      institutionalAlignment: {
        score: instPoints,
        max: 20,
        detail: instDetail,
      },
      provenTrackRecord: {
        score: karmaPoints,
        max: 15,
        detail: trackDetail,
      },
    },
  };
}
