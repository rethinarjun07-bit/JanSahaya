import { CopilotIntent, ExtractedEntities, CopilotContext } from "./types";

export const JHARKHAND_DISTRICTS = [
  "Ranchi", "Dhanbad", "Bokaro", "Jamshedpur", "East Singhbhum", "West Singhbhum",
  "Hazaribagh", "Giridih", "Deoghar", "Dumka", "Palamu", "Garhwa", "Latehar",
  "Chatra", "Koderma", "Jamtara", "Sahebganj", "Pakur", "Godda", "Khunti",
  "Simdega", "Lohardaga", "Gumla", "Ramgarh"
];

const HINDI_DISTRICT_MAP: Record<string, string> = {
  "राँची": "Ranchi", "रांची": "Ranchi", "धनबाद": "Dhanbad", "बोकारो": "Bokaro",
  "जमशेदपुर": "Jamshedpur", "हजारीबाग": "Hazaribagh", "गिरिडीह": "Giridih",
  "देवघर": "Deoghar", "दुमका": "Dumka", "पलामू": "Palamu", "गढ़वा": "Garhwa",
  "लातेहार": "Latehar", "चतरा": "Chatra", "कोडरमा": "Koderma", "जामताड़ा": "Jamtara",
  "साहिबगंज": "Sahebganj", "पाकुड़": "Pakur", "गोड्डा": "Godda", "खूंटी": "Khunti",
  "सिमडेगा": "Simdega", "लोहरदगा": "Lohardaga", "गुमला": "Gumla", "रामगढ़": "Ramgarh",
  "पूर्वी सिंहभूम": "East Singhbhum", "पश्चिमी सिंहभूम": "West Singhbhum"
};

export function detectLanguage(text: string): "en" | "hi" {
  // Check for Devanagari script
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  // Check for common Hinglish words
  const hinglishIndicators = [
    "mera", "meri", "mere", "hai", "hain", "kya", "kahan", "kaise", "karein", "bhi",
    "paas", "pani", "gaon", "sadak", "chot", "aag", "khadan", "shikayat", "madad",
    "batao", "dikhao", "bataiye", "raha", "rahi", "rahe", "hoga", "hogi"
  ];
  const words = text.toLowerCase().split(/\s+/);
  const matchCount = words.filter(w => hinglishIndicators.includes(w)).length;
  return matchCount >= 2 ? "hi" : "en";
}

export function extractEntities(text: string, context?: CopilotContext): ExtractedEntities {
  const lower = text.toLowerCase();
  const entities: ExtractedEntities = {
    language: detectLanguage(text)
  };

  // 1. District extraction
  for (const d of JHARKHAND_DISTRICTS) {
    if (lower.includes(d.toLowerCase())) {
      entities.district = d;
      break;
    }
  }
  if (!entities.district) {
    for (const [hiName, enName] of Object.entries(HINDI_DISTRICT_MAP)) {
      if (text.includes(hiName)) {
        entities.district = enName;
        break;
      }
    }
  }
  // Contextual fallback: if user says "it" or doesn't mention district, inherit from previous context
  if (!entities.district && context?.previousEntities?.district) {
    entities.district = context.previousEntities.district;
  }

  // 2. Category & Keywords extraction
  if (
    lower.includes("flood") || lower.includes("waterlog") || lower.includes("बाढ़") ||
    lower.includes("pani bhar") || lower.includes("submerged") || lower.includes("drainage")
  ) {
    entities.category = "Disaster Management";
    entities.keywords = ["flood", "waterlogging", "storm drainage"];
    entities.severity = (lower.includes("severe") || lower.includes("school") || lower.includes("heavy") || lower.includes("bahut")) ? "HIGH" : "MEDIUM";
    entities.urgencyEstimate = entities.severity === "HIGH" ? 85 : 68;
  } else if (
    lower.includes("fire") || lower.includes("mine") || lower.includes("coal") || lower.includes("subsidence") ||
    lower.includes("खदान") || lower.includes("आग") || lower.includes("धंस") || lower.includes("sinkhole")
  ) {
    entities.category = "Mining & Geology";
    entities.keywords = ["coal fire", "subsidence", "toxic gas"];
    entities.severity = "CRITICAL";
    entities.urgencyEstimate = 94;
  } else if (
    lower.includes("water") || lower.includes("fluoride") || lower.includes("drought") ||
    lower.includes("arsenic") || lower.includes("सूखा") || lower.includes("peene ka pani")
  ) {
    entities.category = "Water & Sanitation";
    entities.keywords = ["fluoride contamination", "drinking water", "drought"];
    entities.severity = "HIGH";
    entities.urgencyEstimate = 82;
  } else if (
    lower.includes("road") || lower.includes("bridge") || lower.includes("pothole") ||
    lower.includes("culvert") || lower.includes("सड़क") || lower.includes("पुल") || lower.includes("sadak")
  ) {
    entities.category = "Infrastructure & Transport";
    entities.keywords = ["road damage", "culvert collapse", "potholes"];
    entities.severity = "MEDIUM";
    entities.urgencyEstimate = 65;
  } else if (
    lower.includes("disease") || lower.includes("epidemic") || lower.includes("hospital") ||
    lower.includes("dengue") || lower.includes("cholera") || lower.includes("बीमारी")
  ) {
    entities.category = "Public Health & Epidemic";
    entities.keywords = ["disease outbreak", "medical assistance"];
    entities.severity = "HIGH";
    entities.urgencyEstimate = 88;
  } else if (context?.previousEntities?.category) {
    // Inherit from context if continued
    entities.category = context.previousEntities.category;
    entities.severity = context.previousEntities.severity;
    entities.urgencyEstimate = context.previousEntities.urgencyEstimate;
  }

  // 3. Affected entities/assets
  if (lower.includes("school") || lower.includes("स्कूल")) entities.affected = "school area";
  else if (lower.includes("road") || lower.includes("highway") || lower.includes("sadak")) entities.affected = "main road / transport corridor";
  else if (lower.includes("hospital") || lower.includes("अस्पताल")) entities.affected = "health center / hospital";
  else if (lower.includes("village") || lower.includes("gaon") || lower.includes("गाँव") || lower.includes("गांव")) entities.affected = "residential village";

  // 4. Challenge ID (e.g. cmtzafi... or JS-...)
  const idMatch = text.match(/\b(cmt[a-z0-9]{20,28}|JS-\d{3,6})\b/i);
  if (idMatch) {
    entities.challengeId = idMatch[1];
  }

  return entities;
}

export function classifyIntent(text: string, context?: CopilotContext): { intent: CopilotIntent; confidence: number } {
  const t = text.trim();
  const lower = t.toLowerCase();

  // 1. EMERGENCY_GUIDANCE (Immediate life-safety)
  if (
    lower.includes("injured") || lower.includes("chot") || lower.includes("bleeding") ||
    lower.includes("khoon") || lower.includes("trapped") || lower.includes("phas gaye") ||
    lower.includes("dying") || lower.includes("heart attack") || lower.includes("snake bite") ||
    lower.includes("सांप") || lower.includes("घायल") || lower.includes("चोट") ||
    (lower.includes("emergency") && (lower.includes("help") || lower.includes("112") || lower.includes("now")))
  ) {
    return { intent: "EMERGENCY_GUIDANCE", confidence: 0.98 };
  }

  // 2. TRACK_MY_REPORT ("Where is my complaint?", "report status", "track my report")
  if (
    lower.includes("where is my") || lower.includes("track my") || lower.includes("track report") ||
    lower.includes("my report") || lower.includes("mera report") || lower.includes("meri shikayat") ||
    lower.includes("status of my") || lower.includes("complaint status") || lower.includes("kahan hai mera report") ||
    lower.includes("report ka status") || lower.includes("shikayat ki sthiti") || lower.includes("status kya hai")
  ) {
    return { intent: "TRACK_MY_REPORT", confidence: 0.95 };
  }

  // 3. EXPLAIN_AI_ANALYSIS ("Why is my urgency 87?", "Why high priority?", "Explain AI analysis")
  if (
    lower.includes("why is my urgency") || lower.includes("why urgency") || lower.includes("urgency 87") ||
    lower.includes("priority score") || lower.includes("urgency score") || lower.includes("ai analysis") ||
    lower.includes("kyun high") || lower.includes("urgency kyun") || lower.includes("why is my problem high") ||
    lower.includes("ai ne yeh score") || lower.includes("factors used")
  ) {
    return { intent: "EXPLAIN_AI_ANALYSIS", confidence: 0.96 };
  }

  // 4. CHECK_DUPLICATE ("Is this already reported?", "Check duplicate")
  if (
    lower.includes("already reported") || lower.includes("pehle se reported") || lower.includes("duplicate") ||
    lower.includes("is this already") || lower.includes("kisi aur ne report") || lower.includes("similar problem")
  ) {
    return { intent: "CHECK_DUPLICATE", confidence: 0.94 };
  }

  // 5. EXPLAIN_JANSAHAYA / WORKFLOW ("What happens after I report?", "What happens after verification?", "platform workflow")
  if (
    lower.includes("what happens after") || lower.includes("after verification") || lower.includes("after i report") ||
    lower.includes("how does jansahaya work") || lower.includes("platform workflow") || lower.includes("quad helix") ||
    lower.includes("process kya hai") || lower.includes("report karne ke baad kya hota hai")
  ) {
    return { intent: "EXPLAIN_JANSAHAYA", confidence: 0.95 };
  }

  // 6. SOLUTION_STATUS ("What solutions have been proposed?", "solution status", "solutions proposed")
  if (
    (lower.includes("solution") || lower.includes("solutions") || lower.includes("samadhan")) &&
    (lower.includes("proposed") || lower.includes("status") || lower.includes("stage") || lower.includes("kya hai") || lower.includes("milestone"))
  ) {
    return { intent: "SOLUTION_STATUS", confidence: 0.92 };
  }

  // 7. UNIVERSITY_SOLVER_HELP ("Who can solve this?", "Why university matched?", "BIT Mesra", "IIT ISM", "solver help")
  if (
    lower.includes("who can solve") || lower.includes("kaun solve") || lower.includes("university matched") ||
    lower.includes("matched university") || lower.includes("solver help") || lower.includes("iit ism") ||
    lower.includes("bit mesra") || lower.includes("researcher match")
  ) {
    return { intent: "UNIVERSITY_SOLVER_HELP", confidence: 0.93 };
  }

  // 8. CSR_INDUSTRY_HELP ("Can CSR fund this?", "CSR funding", "Tata Steel CSR", "industry support")
  if (
    lower.includes("csr") || lower.includes("fund this") || lower.includes("industry support") ||
    lower.includes("tata steel") || lower.includes("coal india funding") || lower.includes("pledge")
  ) {
    return { intent: "CSR_INDUSTRY_HELP", confidence: 0.94 };
  }

  // 9. GIS_LOCATION_EXPLORATION ("Where are critical issues?", "which district has most", "gis map", "show map")
  if (
    lower.includes("where are the critical") || lower.includes("which district has") ||
    lower.includes("most active challenges") || lower.includes("gis map") || lower.includes("open map") ||
    lower.includes("show map") || lower.includes("map view") || lower.includes("district pulse")
  ) {
    return { intent: "GIS_LOCATION_EXPLORATION", confidence: 0.92 };
  }

  // 10. FIND_LOCAL_PROBLEMS ("problems near me", "local problems", "near Ranchi", "aaspas ki samasya")
  if (
    lower.includes("near me") || lower.includes("local problems") || lower.includes("problems near") ||
    lower.includes("aaspas") || lower.includes("mere paas") || lower.includes("nearby issues")
  ) {
    return { intent: "FIND_LOCAL_PROBLEMS", confidence: 0.90 };
  }

  // 11. FIND_PROBLEMS ("What problems are active in Ranchi?", "show flooding problems in Dhanbad", "active challenges in...")
  const hasDistrict = JHARKHAND_DISTRICTS.some(d => lower.includes(d.toLowerCase())) ||
    Object.keys(HINDI_DISTRICT_MAP).some(k => t.includes(k));
  if (
    hasDistrict &&
    (lower.includes("what problem") || lower.includes("problems") || lower.includes("active") ||
     lower.includes("challenges") || lower.includes("kya samasya") || lower.includes("show") || lower.includes("dikhao"))
  ) {
    return { intent: "FIND_PROBLEMS", confidence: 0.93 };
  }

  // 12. GOVERNMENT_SCHEME_GUIDANCE ("SDRF", "compensation", "yojana", "muawza", "pm relief", "crop loss")
  if (
    lower.includes("scheme") || lower.includes("compensation") || lower.includes("sdrf") ||
    lower.includes("yojana") || lower.includes("muawza") || lower.includes("fasal bima") ||
    lower.includes("pm relief") || lower.includes("मुआवज़ा") || lower.includes("योजना")
  ) {
    return { intent: "GOVERNMENT_SCHEME_GUIDANCE", confidence: 0.92 };
  }

  // 13. REPORT_PROBLEM ("There is severe flooding near my village", "mere gaon mein pani bhar gaya hai", "broken bridge")
  if (
    lower.includes("there is") || lower.includes("severe") || lower.includes("flooding") ||
    lower.includes("pani bhar") || lower.includes("aa gaya") || lower.includes("report this") ||
    lower.includes("shikayat karni") || lower.includes("broken") || lower.includes("kharab hai") ||
    lower.includes("waterlogging") || lower.includes("leakage") || lower.includes("landslide") ||
    lower.includes("road is") || lower.includes("bridge crack")
  ) {
    return { intent: "REPORT_PROBLEM", confidence: 0.91 };
  }

  // Contextual continuation: if previous was REPORT_PROBLEM and user adds detail e.g. "It is affecting the main road" or "Can I report it?"
  if (context?.previousIntent === "REPORT_PROBLEM") {
    if (lower.includes("it") || lower.includes("report") || lower.includes("main road") || lower.includes("road") || lower.includes("kar sakte") || lower.includes("yes")) {
      return { intent: "REPORT_PROBLEM", confidence: 0.89 };
    }
  }

  // 14. GENERAL_CONVERSATION ("hello", "hi", "namaste", "thank you")
  if (
    /^(hi|hello|hey|namaste|pranam|namaskar|good morning|good evening|kaise ho|kese ho|shukriya|thanks|thank you)\b/i.test(t) ||
    t === "hi" || t === "hello" || t === "नमस्ते" || t === "प्रणाम"
  ) {
    return { intent: "GENERAL_CONVERSATION", confidence: 0.96 };
  }

  // 15. GENERAL_JANSAHAYA_QUESTION ("Who made this?", "What is JanSahaya?")
  if (
    lower.includes("jansahaya") || lower.includes("who created") || lower.includes("who built") ||
    lower.includes("sih") || lower.includes("what can you do")
  ) {
    return { intent: "GENERAL_JANSAHAYA_QUESTION", confidence: 0.88 };
  }

  // 16. Out-of-scope domain check (e.g. "capital of france", "who won world cup")
  if (
    lower.includes("capital of") || lower.includes("who is elon") || lower.includes("president of") ||
    lower.includes("recipe") || lower.includes("movie")
  ) {
    return { intent: "UNKNOWN", confidence: 0.95 };
  }

  return { intent: "UNKNOWN", confidence: 0.5 };
}
