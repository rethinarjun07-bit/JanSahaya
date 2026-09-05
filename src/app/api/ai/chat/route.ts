import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// ============================================================
// ADVANCED SYSTEM PROMPT — JanSahaya AI v2
// Covers: disasters, health, agriculture, law, schemes, general
// ============================================================
const SYSTEM_PROMPT = `You are JanSahaya AI — a highly intelligent, empathetic, and advanced virtual assistant built for the citizens, researchers, industries, and government officials of Jharkhand, India. You were created as part of Smart India Hackathon project SIH26043.

## YOUR IDENTITY
- Name: JanSahaya AI (जनसहाया AI)
- Creator: Team JanSamadhan, BIT Mesra / IIT ISM Dhanbad
- Powered by: Google Gemini AI
- Purpose: Help people with disaster management, government schemes, societal problems, and platform usage

## LANGUAGE INTELLIGENCE
- Detect the user's language automatically (English, Hindi, Santali, Bengali, Odia, Maithili, Bhojpuri, Nagpuri)
- ALWAYS respond in the SAME language the user writes in
- If mixed languages, respond in the dominant language
- Be culturally sensitive — use respectful forms (aap, आप) in Hindi
- If user writes in Santali/tribal language, try to respond with basic understanding and English/Hindi mix

## WHAT YOU CAN ANSWER — NO TOPIC IS TOO BROAD
You are an intelligent general assistant with deep expertise in:

### 🚨 EMERGENCY & DISASTER MANAGEMENT
- Floods, earthquakes, droughts, landslides, mining accidents, cyclones, fires
- Step-by-step emergency protocols for every disaster type
- Evacuation routes and shelter locations in Jharkhand
- Search and rescue guidance
- First aid instructions
- What to do BEFORE, DURING, and AFTER each disaster type
- Jharkhand-specific disaster history and risk zones

### 🏛️ GOVERNMENT SCHEMES & COMPENSATION
- SDRF (State Disaster Response Fund) — amounts, eligibility, how to apply
- NDRF assistance procedures
- PM Relief Fund claims
- PM Awas Yojana, PM Kisan, MGNREGA, Ayushman Bharat
- Jan Dhan Yojana, Mudra Loan, Skill India
- Jharkhand state schemes: Mukhyamantri Kanyadan Yojana, Savitribai Phule Kishori Samridhi Yojana, Birsa Harit Gram Yojana
- How to get Aadhar, ration card, birth/death certificate, caste certificate
- RTI (Right to Information) filing process
- Grievance redressal mechanisms

### 💊 HEALTH & MEDICAL
- Common diseases during floods (cholera, malaria, dengue, leptospirosis)
- First aid for snake bites, burns, fractures, drowning
- Nearest hospitals and PHCs in Jharkhand
- Janani Suraksha Yojana for pregnant women
- Child vaccination schedule (NIS)
- Mental health support during disaster trauma
- Ayushman Bharat card — how to get and use it

### 🌾 AGRICULTURE & RURAL DEVELOPMENT
- Crop damage compensation procedures
- PM Fasal Bima Yojana (PMFBY) claims
- Jharkhand drought relief
- Soil health card, KCC (Kisan Credit Card)
- Minimum Support Price (MSP) updates
- ATMA (Agricultural Technology Management Agency) contacts

### 🏗️ INFRASTRUCTURE & ENVIRONMENT
- Road damage reporting and compensation
- Electricity restoration during disasters
- Water contamination testing
- Forest rights for tribal communities (PESA Act, FRA 2006)
- Mining safety regulations in Jharkhand
- Coal mine subsidence compensation (CMPF)
- Industrial pollution complaints (JSPCB)

### 🌐 PLATFORM HELP (JanSahaya)
- How to register and use the platform for each role (Citizen, Solver, Industry, Admin)
- How to submit a disaster challenge/complaint
- How to track your submitted complaint
- How to apply as a Solver and respond to challenges
- How to report via SMS: "FLOOD RANCHI HIGH"
- Understanding challenge status (Submitted → Under Review → Solved → Merged)
- How researchers/universities can propose solutions
- Industry partnership and CSR funding

### 📞 EMERGENCY CONTACTS — JHARKHAND
- National Emergency: 112
- SDMA Jharkhand: 0651-2446900
- Chief Minister Helpline: 181
- NDRF Ranchi: 0651-2290000
- Women Helpline: 1091
- Child Helpline: 1098
- Poison Control: 1800-116-117
- Coal India Emergency: 1800-345-3012
- Jharkhand Police: 100
- Fire: 101
- Ambulance: 108

### 🌍 GENERAL KNOWLEDGE & GUIDANCE
- Answer general questions people ask in daily life
- Help with legal rights, RTI, consumer protection
- Education — scholarships for students in Jharkhand
- Employment — job portals, skill development
- Environmental awareness — climate change impacts on Jharkhand
- Tribal rights and cultural preservation

## CONVERSATION STYLE
- Be warm, respectful, and empathetic — these are often people in distress
- Start emergency responses with: 🚨 and immediate action steps
- Use numbered lists for step-by-step guidance
- Use emojis appropriately to make responses friendly
- Keep responses focused but COMPLETE — never cut off mid-answer
- If you don't know something specific, be honest but always try to help with what you DO know
- Always end with: "Is there anything else I can help you with? / क्या मैं और कुछ मदद कर सकता हूं?"
- For life-threatening emergencies: ALWAYS first tell them to call 112

## RESPONSE FORMAT
- Use **bold** for important terms
- Use numbered lists (1. 2. 3.) for steps
- Use bullet points for options/lists
- Keep paragraphs short
- Add relevant contact numbers when helpful
- For Hindi responses, use Devanagari script naturally

## PLATFORM CONTEXT
The user is on JanSahaya — a disaster management & societal innovation platform for Jharkhand. They may be:
- A CITIZEN reporting a disaster or seeking help
- A SOLVER (researcher/university) looking to help
- An INDUSTRY partner looking to fund solutions
- A GOVERNMENT OFFICIAL managing responses

Tailor your answers to what seems most relevant to their role and question.`;

export async function POST(request: NextRequest) {
  let message = "";
  try {
    const body = await request.json();
    message = body.message ?? "";
    const { history, userRole } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Add role context to system prompt if available
    const roleContext = userRole
      ? `\n\n## CURRENT USER ROLE: ${userRole}\nTailor your response appropriately for a ${userRole} user.`
      : "";

    const fullSystemPrompt = SYSTEM_PROMPT + roleContext;

    const apiKey = (process.env.GEMINI_API_KEY || "").replace(/^["']|["']$/g, "").trim();
    if (!apiKey || apiKey.includes("Demo-Replace")) {
      return NextResponse.json({
        reply: getDemoResponse(message),
        isDemo: true,
        detectedLanguage: "en",
      });
    }

    // Build multi-turn conversation history
    const contents = [
      ...(history || []).slice(-10).map((h: { role: string; text: string }) => ({
        role: h.role as "user" | "model",
        parts: [{ text: h.text }],
      })),
      { role: "user" as const, parts: [{ text: message }] },
    ];

    const ai = new GoogleGenAI({ apiKey });

    let reply = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          maxOutputTokens: 1000,
          temperature: 0.6,
          topP: 0.9,
          topK: 40,
        },
      });
      reply = response.text || "";
    } catch (modelErr) {
      console.warn("gemini-3.7-flash failed, falling back to gemini-flash-latest:", modelErr);
      const fallbackRes = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: {
          systemInstruction: fullSystemPrompt,
          maxOutputTokens: 1000,
          temperature: 0.6,
        },
      });
      reply = fallbackRes.text || "";
    }

    if (!reply) {
      reply = getDemoResponse(message);
    }

    // Detect language from user message for the UI
    const isHindi = /[\u0900-\u097F]/.test(message);
    const detectedLanguage = isHindi ? "hi" : "en";

    return NextResponse.json({ reply, isDemo: false, detectedLanguage });
  } catch (error: unknown) {
    console.error("Gemini chat error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);

    // Handle specific error types
    if (errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json({
        reply: "I'm experiencing high traffic right now. For immediate emergency help, call **112**. For SDMA: **0651-2446900**. Please try again in a moment.",
        isDemo: true,
      });
    }

    return NextResponse.json({
      reply: getDemoResponse(message || ""),
      isDemo: true,
    });
  }
}

// ============================================================
// RICH DEMO RESPONSES (fallback when API key not set)
// ============================================================
function getDemoResponse(message: string): string {
  const msg = message.toLowerCase();
  const isHindi = /[\u0900-\u097F]/.test(message);

  // FLOOD
  if (msg.includes("flood") || msg.includes("बाढ़") || msg.includes("पानी")) {
    return isHindi
      ? `🌊 **बाढ़ के दौरान क्या करें:**\n\n1. **तुरंत** ऊंची जगह पर जाएं\n2. **112** पर कॉल करें\n3. बिजली का मुख्य स्विच बंद करें\n4. बाढ़ के पानी में न चलें — 6 इंच पानी भी खतरनाक हो सकता है\n5. जरूरी दस्तावेज़, दवाइयां और मोबाइल चार्जर साथ लें\n6. SDMA हेल्पलाइन: **0651-2446900**\n\nक्या मैं और कुछ मदद कर सकता हूं?`
      : `🌊 **Flood Emergency — Immediate Steps:**\n\n1. **Move to higher ground immediately**\n2. Call **112** for rescue\n3. Turn off electricity at the main switch\n4. Never walk in floodwater — 6 inches can knock you down\n5. Take medicines, ID documents & phone charger\n6. Stay away from rivers, drains, and power lines\n\n**NDRF Ranchi:** 0651-2290000\n**SDMA Jharkhand:** 0651-2446900\n\nIs there anything else I can help you with?`;
  }

  // EARTHQUAKE
  if (msg.includes("earthquake") || msg.includes("भूकंप")) {
    return `🏚️ **Earthquake Safety:**\n\n**During shaking:**\n1. DROP, COVER, HOLD ON\n2. Get under a sturdy table or desk\n3. Stay away from windows, mirrors, and heavy furniture\n4. Do NOT run outside during shaking\n\n**After shaking:**\n1. Check yourself and others for injuries\n2. Expect aftershocks\n3. Check for gas leaks — if smell gas, leave immediately\n4. Call **112** if anyone is trapped\n\nIs there anything else I can help you with?`;
  }

  // GOVERNMENT SCHEMES
  if (msg.includes("scheme") || msg.includes("compensation") || msg.includes("मुआवज़") || msg.includes("योजना")) {
    return `💰 **Disaster Compensation Schemes in Jharkhand:**\n\n**1. SDRF (State Disaster Response Fund)**\n- House damage: ₹95,100 (full) / ₹10,200 (partial)\n- Crop loss: ₹13,500/hectare (irrigated)\n- Death: ₹4 lakh to family\n- Apply at: District Collector office\n\n**2. PM Relief Fund**\n- Apply via: pmrelief.gov.in\n- Documents: Aadhar, damage photos, FIR copy\n\n**3. Pradhan Mantri Fasal Bima**\n- Crop loss insurance\n- Apply via nearest bank or CSC center\n\n**Chief Minister Helpline:** 181\n\nIs there anything else I can help you with?`;
  }

  // REPORT DISASTER
  if (msg.includes("report") || msg.includes("submit") || msg.includes("शिकायत")) {
    return `📋 **How to Report a Disaster on JanSahaya:**\n\n**Option 1 — Online:**\n1. Click **"Post Challenge"** in the top menu\n2. Select disaster category\n3. Pin your location on the map\n4. Add photos and description\n5. Submit — reviewed within 2 hours\n\n**Option 2 — SMS (No internet needed):**\nSend: \`FLOOD RANCHI CRITICAL\` to our helpline\n\n**Option 3 — Voice:**\nGo to AI Report page → tap mic → speak in Hindi/Santali\n\n**Option 4 — Call:**\nSDMA: **0651-2446900** | Emergency: **112**\n\nIs there anything else I can help you with?`;
  }

  // MINING
  if (msg.includes("mine") || msg.includes("coal") || msg.includes("mining") || msg.includes("खदान")) {
    return `⛏️ **Mining Emergency in Jharkhand:**\n\n**Immediate Actions:**\n1. Call **112** immediately\n2. Alert Coal India Emergency: **1800-345-3012** (toll-free)\n3. Do NOT enter the mine area\n4. Evacuate 500m radius\n\n**Compensation for Mining Accidents:**\n- CMPF (Coal Mines Provident Fund) disability/death benefits\n- WC Act compensation from mine management\n- DGMS (Directorate General of Mines Safety): 0326-2220009\n\n**Report mine subsidence on JanSahaya** under category: "Mining Subsidence & Underground Fires"\n\nIs there anything else I can help you with?`;
  }

  // DEFAULT / GREETING
  return `🙏 **Namaste! I'm JanSahaya AI**\n\nI'm your advanced assistant for disaster management and societal support in Jharkhand. I can help you with:\n\n🚨 **Emergency guidance** — floods, earthquakes, fires, mining accidents\n💰 **Government schemes** — SDRF, PM Relief, Fasal Bima, Jan Dhan\n💊 **Health advice** — first aid, disease prevention during disasters\n📋 **Platform help** — how to report, track, and resolve disaster challenges\n🌾 **Agriculture** — crop damage claims, drought relief\n📞 **Emergency contacts** for all Jharkhand districts\n\n_Ask me anything in English, Hindi, Santali, or Bengali!_\n\nWhat can I help you with today?`;
}
