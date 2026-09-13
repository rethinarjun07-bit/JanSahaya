import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getUserFromRequest } from "@/lib/auth";
import { VoiceReportInputSchema } from "@/lib/validators";
import { getClientIp, checkRateLimit, createRateLimitResponse, RATE_LIMIT_BUCKETS } from "@/lib/rate-limiter";
import { safeLog } from "@/lib/safe-logger";

export async function POST(request: NextRequest) {
  try {
    // ── 1. Rate Limiting ────────────────────────────────────────────────────
    const tokenUser = await getUserFromRequest(request);
    const clientIp = getClientIp(request);
    const bucket = tokenUser ? RATE_LIMIT_BUCKETS.AI_AUTHED : RATE_LIMIT_BUCKETS.AI_ANON;
    const identifier = tokenUser ? `user:${tokenUser.userId}` : `ip:${clientIp}`;
    const rl = checkRateLimit(identifier, bucket);

    if (!rl.success) {
      return createRateLimitResponse(rl.reset, "Voice report rate limit exceeded. Please wait.");
    }

    // ── 2. Input Validation ────────────────────────────────────────────────
    const body = await request.json();
    const result = VoiceReportInputSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { transcript, language } = result.data;

    // ── 3. Check for API key or use local engine ───────────────────────────
    const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    if (!apiKey || apiKey.includes("Demo") || apiKey.includes("your_gemini")) {
      return NextResponse.json(demoVoiceResponse(transcript));
    }

    const client = new GoogleGenAI({ apiKey });
    const sanitizedTranscript = transcript.slice(0, 4000).replace(/["\\]/g, " ");

    const systemInstruction = `You are a disaster report assistant for Jharkhand, India.
Extract structured disaster report information and respond in strict JSON matching this schema:
{
  "detectedLanguage": "English/Hindi/Santali/Bengali",
  "translatedText": "English translation of what was said",
  "title": "Short challenge title in English (max 80 chars)",
  "description": "Detailed description of the incident in English",
  "category": "one of: Flood & Inundation | Disaster Management | Mining & Geology | Health & Hazardous Waste | Infrastructure & Municipal | Environment & Forestry | Water & Sanitation | Drought & Groundwater Depletion | Agriculture & Rural Development | Mining Subsidence & Underground Fires",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "district": "Jharkhand district name if mentioned, else empty string",
  "keywords": ["array", "of", "key", "terms"]
}`;

    const userPrompt = `Voice transcript (Spoken in ${language || "Indian language"}):
"""
${sanitizedTranscript}
"""`;

    const response = await client.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        maxOutputTokens: 400,
      },
    });

    const parsedResult = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, ...parsedResult });
  } catch (error) {
    safeLog.error("Voice report error:", error);
    return NextResponse.json({ error: "Voice processing failed" }, { status: 500 });
  }
}

function demoVoiceResponse(transcript: string) {
  const lower = transcript.toLowerCase();
  let category = "Disaster Management";
  let severity = "HIGH";

  if (lower.includes("flood") || lower.includes("water") || lower.includes("बाढ़") || lower.includes("पानी")) {
    category = "Flood & Inundation"; severity = "CRITICAL";
  } else if (lower.includes("fire") || lower.includes("आग") || lower.includes("mine") || lower.includes("coal")) {
    category = "Mining Subsidence & Underground Fires"; severity = "CRITICAL";
  } else if (lower.includes("road") || lower.includes("bridge") || lower.includes("सड़क")) {
    category = "Infrastructure & Municipal"; severity = "MEDIUM";
  }

  return {
    success: true,
    detectedLanguage: /[\u0900-\u097F]/.test(transcript) ? "Hindi" : "English",
    translatedText: transcript,
    title: `Voice Report: ${category} incident`,
    description: `Citizen voice report (auto-transcribed): "${transcript}"\n\nThis was reported via voice in a local language and auto-processed by JanSahaya AI.`,
    category,
    severity,
    district: "",
    keywords: ["voice-report", "auto-parsed"],
  };
}
