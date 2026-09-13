export type CopilotIntent =
  | "REPORT_PROBLEM"
  | "TRACK_MY_REPORT"
  | "FIND_PROBLEMS"
  | "FIND_LOCAL_PROBLEMS"
  | "EXPLAIN_AI_ANALYSIS"
  | "CHECK_DUPLICATE"
  | "EXPLAIN_JANSAHAYA"
  | "EMERGENCY_GUIDANCE"
  | "GOVERNMENT_SCHEME_GUIDANCE"
  | "SOLUTION_STATUS"
  | "UNIVERSITY_SOLVER_HELP"
  | "CSR_INDUSTRY_HELP"
  | "GIS_LOCATION_EXPLORATION"
  | "GENERAL_JANSAHAYA_QUESTION"
  | "GENERAL_CONVERSATION"
  | "UNKNOWN";

export interface CopilotAction {
  label: string;
  url?: string;
  prompt?: string;
  variant?: "primary" | "secondary" | "danger" | "outline";
  icon?: string;
}

export interface CopilotCardItem {
  label: string;
  value: string;
  badge?: string;
  badgeColor?: "red" | "amber" | "green" | "blue" | "slate";
}

export interface CopilotCard {
  type:
    | "problem_report"
    | "challenge_pulse"
    | "report_tracker"
    | "ai_explanation"
    | "duplicate_alert"
    | "emergency_banner"
    | "solutions_list"
    | "workflow_stages";
  title: string;
  items?: CopilotCardItem[];
  meta?: Record<string, unknown>;
}

export interface ExtractedEntities {
  district?: string;
  category?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  urgencyEstimate?: number;
  keywords?: string[];
  affected?: string;
  problemDescription?: string;
  challengeId?: string;
  language?: "en" | "hi";
}

export interface CopilotUserSession {
  userId: string;
  name: string;
  email: string;
  role: string;
  district?: string;
}

export interface CopilotContext {
  user?: CopilotUserSession | null;
  history?: Array<{ role: "user" | "model"; text: string }>;
  previousIntent?: CopilotIntent;
  previousEntities?: ExtractedEntities;
}

export interface CopilotResponse {
  reply: string;
  intent: CopilotIntent;
  confidence: number;
  actions: CopilotAction[];
  card?: CopilotCard;
  isDemo: boolean;
  detectedLanguage: "en" | "hi";
  groundedSource?: string;
}
