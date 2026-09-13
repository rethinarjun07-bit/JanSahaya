import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { processCopilotMessage } from "@/lib/copilot/orchestrator";
import { CopilotContext } from "@/lib/copilot/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let message = "";
  try {
    const body = await request.json();
    message = (body.message || "").trim();
    const { history, previousIntent, previousEntities } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Authenticate user from JWT cookies or Authorization header
    const tokenUser = await getUserFromRequest(request);

    // 2. Assemble conversational context
    const context: CopilotContext = {
      user: tokenUser
        ? {
            userId: tokenUser.userId,
            name: tokenUser.name,
            email: tokenUser.email,
            role: tokenUser.role,
            district: tokenUser.district,
          }
        : null,
      history: Array.isArray(history) ? history : [],
      previousIntent,
      previousEntities,
    };

    // 3. Process with Civic Copilot Engine
    const copilotResult = await processCopilotMessage(message, context);

    return NextResponse.json(copilotResult);
  } catch (error: unknown) {
    console.error("Civic Copilot Error:", error);

    // Failsafe: Emergency contact and graceful fallback
    const isHindi = /[\u0900-\u097F]/.test(message);
    return NextResponse.json({
      reply: isHindi
        ? `⚠️ जनसहाया सेवा से संपर्क करने में समस्या हुई। आपातकाल में तुरंत **112** पर कॉल करें।\n\nझारखंड SDMA: **0651-2446900**`
        : `⚠️ Could not connect to JanSahaya services. For immediate emergencies, please call **112**.\n\nJharkhand SDMA: **0651-2446900**`,
      intent: "UNKNOWN",
      confidence: 0,
      actions: [
        { label: "🚨 Call 112", url: "tel:112", variant: "danger" },
        { label: "🗺️ Open GIS Map", url: "/map", variant: "outline" },
      ],
      isDemo: true,
      detectedLanguage: isHindi ? "hi" : "en",
    });
  }
}
