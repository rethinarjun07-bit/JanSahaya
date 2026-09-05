import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function POST(request: NextRequest) {
  try {
    const { transcript, language } = await request.json();

    if (!transcript?.trim()) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("Demo")) {
      return NextResponse.json(demoVoiceResponse(transcript));
    }

    const prompt = `You are a disaster report assistant for Jharkhand, India.
The user spoke in ${language || "an Indian language (Hindi, Santali, English, or Bengali)"}.

Their voice message was transcribed as:
"${transcript}"

Extract structured disaster report information and respond in JSON:
{
  "detectedLanguage": "English/Hindi/Santali/Bengali",
  "translatedText": "English translation of what they said",
  "title": "Short challenge title in English (max 80 chars)",
  "description": "Detailed description of the incident in English",
  "category": "one of: Flood & Inundation | Disaster Management | Mining & Geology | Health & Hazardous Waste | Infrastructure & Municipal | Environment & Forestry | Water & Sanitation | Drought & Groundwater Depletion | Agriculture & Rural Development | Mining Subsidence & Underground Fires",
  "severity": "CRITICAL | HIGH | MEDIUM | LOW",
  "district": "Jharkhand district name if mentioned, else empty string",
  "keywords": ["array", "of", "key", "terms"]
}

Be generous — if they mention water/rain/flooding → Flood & Inundation. Mining/coal/fire underground → Mining Subsidence.`;

    const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    const client = new GoogleGenAI({ apiKey });

    const response = await client.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: { responseMimeType: "application/json", maxOutputTokens: 400 },
    });

    const result = JSON.parse(response.text || "{}");
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Voice report error:", error);
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
