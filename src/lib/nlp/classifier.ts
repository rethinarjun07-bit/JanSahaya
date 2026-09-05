/**
 * Automatic Challenge Classification, Problem Segregation & Urgency Scoring
 */

export interface ClassificationResult {
  predictedCategory: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgencyScore: number;
  tags: string[];
  recommendedUniversity: {
    name: string;
    code: string;
    rationale: string;
  };
  isDisasterEmergency: boolean;
}

const CRITICAL_KEYWORDS = [
  "trapped", "casualty", "casualties", "collapse", "collapsed", "breach", "breached",
  "flash flood", "toxic gas", "explosion", "underground fire", "landslide", "drowning",
  "death", "deaths", "chlorine leak", "subterranean fire", "crushed", "evacuation"
];

const HIGH_KEYWORDS = [
  "subsidence", "sinkhole", "epidemic", "outbreak", "arsenic", "fluoride", "contamination",
  "contaminated", "drought", "starvation", "severe water crisis", "dam overflow", "embankment crack",
  "forest fire", "stampede", "wildlife attack", "elephant conflict", "lightning deaths"
];

const MEDIUM_KEYWORDS = [
  "waterlogging", "drainage", "culvert", "pothole", "potholes", "overflow", "bridge crack",
  "fly ash", "industrial effluent", "garbage dumping", "crop pest", "power outage", "siltation"
];

export function classifyChallenge(title: string, description: string): ClassificationResult {
  const combined = `${title} ${description}`.toLowerCase();
  
  // 1. Detect tags
  const tags: string[] = [];
  const tagRules: Array<{ tag: string; terms: string[] }> = [
    { tag: "Flood & Drainage", terms: ["flood", "flooding", "waterlogging", "drainage", "water accumulation", "submerged"] },
    { tag: "Mine Safety & Fire", terms: ["coal", "mine", "mining", "subsidence", "underground fire", "methane", "blast"] },
    { tag: "Water Quality & Drought", terms: ["fluoride", "arsenic", "drought", "borewell", "groundwater", "drinking water"] },
    { tag: "River Erosion & Silt", terms: ["erosion", "embankment", "riverbank", "siltation", "ganga", "subarnarekha"] },
    { tag: "Forest & Wildlife", terms: ["forest fire", "wildfire", "elephant", "habitat", "timber", "sanctuary"] },
    { tag: "Public Health", terms: ["epidemic", "dengue", "cholera", "malaria", "silicosis", "hospital", "toxic"] },
    { tag: "Infrastructure", terms: ["bridge", "road", "culvert", "crack", "highway", "dam", "flyover"] },
    { tag: "Industrial Waste", terms: ["fly ash", "effluent", "slurry", "chemical runoff", "smog", "pollution"] },
  ];

  for (const rule of tagRules) {
    if (rule.terms.some((term) => combined.includes(term))) {
      tags.push(rule.tag);
    }
  }
  if (tags.length === 0) tags.push("Societal Infrastructure");

  // 2. Compute Urgency & Severity
  let urgency = 45;
  let severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "MEDIUM";
  let isDisasterEmergency = false;

  const criticalMatches = CRITICAL_KEYWORDS.filter((k) => combined.includes(k));
  const highMatches = HIGH_KEYWORDS.filter((k) => combined.includes(k));
  const mediumMatches = MEDIUM_KEYWORDS.filter((k) => combined.includes(k));

  if (criticalMatches.length > 0) {
    severity = "CRITICAL";
    urgency = Math.min(100, 85 + criticalMatches.length * 4);
    isDisasterEmergency = true;
  } else if (highMatches.length > 0) {
    severity = "HIGH";
    urgency = Math.min(84, 65 + highMatches.length * 5);
    isDisasterEmergency = true;
  } else if (mediumMatches.length > 0) {
    severity = "MEDIUM";
    urgency = Math.min(64, 40 + mediumMatches.length * 4);
  } else {
    severity = "LOW";
    urgency = 28;
  }

  // 3. Predict Primary Category
  let predictedCategory = "Disaster Management";
  if (combined.includes("coal") || combined.includes("mine") || combined.includes("subsidence")) {
    predictedCategory = "Mining & Geology";
  } else if (combined.includes("water") || combined.includes("fluoride") || combined.includes("borewell") || combined.includes("drought")) {
    predictedCategory = "Water & Sanitation";
  } else if (combined.includes("crop") || combined.includes("farming") || combined.includes("rural") || combined.includes("soil")) {
    predictedCategory = "Agriculture & Rural Development";
  } else if (combined.includes("forest") || combined.includes("elephant") || combined.includes("wildfire")) {
    predictedCategory = "Environment & Forestry";
  } else if (combined.includes("road") || combined.includes("bridge") || combined.includes("building") || combined.includes("culvert")) {
    predictedCategory = "Infrastructure & Transport";
  } else if (combined.includes("disease") || combined.includes("fever") || combined.includes("health") || combined.includes("poison")) {
    predictedCategory = "Public Health & Epidemic";
  }

  // 4. Determine Recommended Premier Institute in Jharkhand
  let recommendedUniversity = {
    name: "Birla Institute of Technology, Mesra",
    code: "BIT-MESRA",
    rationale: "Premier competence in GIS, Flood Hydrology, and Aerial Drone Remote Sensing.",
  };

  if (predictedCategory === "Mining & Geology" || combined.includes("coal") || combined.includes("fire") || combined.includes("geology")) {
    recommendedUniversity = {
      name: "IIT (ISM) Dhanbad",
      code: "IIT-ISM",
      rationale: "National center of excellence for Subterranean Coal Fire Control, Geomechanics & Mine Safety.",
    };
  } else if (predictedCategory === "Environment & Forestry" || predictedCategory === "Agriculture & Rural Development") {
    recommendedUniversity = {
      name: "Birsa Agricultural University, Ranchi",
      code: "BAU-RANCHI",
      rationale: "Specialized in Agro-Climatic Resilience, Forest Fire Ecology, and Drought Adaptation.",
    };
  } else if (predictedCategory === "Infrastructure & Transport" || combined.includes("effluent") || combined.includes("industrial")) {
    recommendedUniversity = {
      name: "National Institute of Technology, Jamshedpur",
      code: "NIT-JSR",
      rationale: "Top-ranked department for Civil Structural Resilience and Industrial Heavy-Metal Remediation.",
    };
  } else if (predictedCategory === "Public Health & Epidemic") {
    recommendedUniversity = {
      name: "AIIMS Deoghar",
      code: "AIIMS-DEO",
      rationale: "State authority on Disaster Medicine, Waterborne Disease Surveillance, and Mass Casualty Triage.",
    };
  }

  return {
    predictedCategory,
    severity,
    urgencyScore: urgency,
    tags,
    recommendedUniversity,
    isDisasterEmergency,
  };
}
