import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_PROMPT = `You are JanSahaya AI — an expert disaster management assistant for Jharkhand, India.
You help citizens, researchers, and government officials with:
- What to do during floods, earthquakes, fires, mining accidents, droughts
- How to report disasters through this platform
- First aid and emergency procedures
- Government schemes and compensation for disaster victims (NDRF, SDRF, PM Relief Fund)
- Location-specific guidance for Jharkhand's 24 districts
- Evacuation routes and nearest shelters
- Contact numbers for SDMA, NDRF, local administration

You support: English, Hindi (हिंदी), and can understand basic Santali/tribal phrases.
Always respond in the same language the user writes in.
Keep responses concise, actionable, and compassionate.
For emergencies, always start with: "🚨 EMERGENCY: Call 112 immediately."
Format important steps as numbered lists.
You are NOT a general AI — only answer disaster-related questions.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("Demo")) {
      // Fallback demo responses when no API key is set
      return NextResponse.json({
        reply: getDemoResponse(message),
        isDemo: true,
      });
    }

    // Build chat history for multi-turn conversation
    const contents = [
      ...(history || []).map((h: { role: string; text: string }) => ({
        role: h.role as "user" | "model",
        parts: [{ text: h.text }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 600,
        temperature: 0.4,
      },
    });

    return NextResponse.json({ reply: response.text, isDemo: false });
  } catch (error) {
    console.error("Gemini chat error:", error);
    return NextResponse.json({
      reply: "I'm having trouble connecting right now. For emergencies, call **112** immediately. For SDMA Jharkhand: **0651-2446900**.",
      isDemo: true,
    });
  }
}

function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("flood") || msg.includes("बाढ़")) {
    return "🌊 **Flood Emergency Steps:**\n1. Move to higher ground immediately\n2. Call 112 for rescue\n3. Don't walk in floodwater — 6 inches can knock you down\n4. Turn off electricity at the main switch\n5. Take medicines, documents & phone charger\n\nNearest NDRF team: Ranchi (0651-2290000)";
  }
  if (msg.includes("earthquake") || msg.includes("भूकंप")) {
    return "🏚️ **Earthquake Steps:**\n1. DROP, COVER, HOLD ON\n2. Stay away from windows and heavy furniture\n3. Don't run outside during shaking\n4. After shaking stops, check for injuries\n5. Expect aftershocks\n\nCall 112 for rescue.";
  }
  if (msg.includes("report") || msg.includes("submit")) {
    return "📋 **To report a disaster:**\n1. Click **'Post Challenge'** in the top menu\n2. Choose category (Flood, Mining, Fire etc)\n3. Drop a pin on the map for exact location\n4. Add photos if safe to do so\n5. Submit — our team reviews within 2 hours\n\nAlternatively, SMS: **FLOOD RANCHI HIGH** to our helpline.";
  }
  if (msg.includes("compensation") || msg.includes("scheme") || msg.includes("मुआवज़ा")) {
    return "💰 **Disaster Compensation Schemes:**\n- **SDRF** (State Disaster Response Fund): ₹4,100–₹1,00,000 based on damage\n- **PM Relief Fund**: Apply via district collector\n- **Crop Loss**: PM Fasal Bima — contact nearest bank\n\nDocuments needed: Aadhar, land papers, FIR copy, damage photos.\nContact: District Collector office or call 181 (Jharkhand helpline).";
  }
  return "🙏 Namaste! I'm JanSahaya AI, your disaster management assistant for Jharkhand.\n\nI can help you with:\n• **Emergency steps** during floods, earthquakes, fires\n• **How to report** disasters on this platform\n• **Government compensation** schemes\n• **Contact numbers** for rescue teams\n\nWhat do you need help with? (You can ask in Hindi too!)";
}
