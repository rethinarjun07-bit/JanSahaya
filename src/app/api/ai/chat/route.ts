import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { processCopilotMessage } from "@/lib/copilot/orchestrator";
import { CopilotContext } from "@/lib/copilot/types";
import { ChatMessageSchema } from "@/lib/validators";
import { getClientIp, checkRateLimit, createRateLimitResponse, RATE_LIMIT_BUCKETS } from "@/lib/rate-limiter";
import { safeLog } from "@/lib/safe-logger";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let message = "";
  try {
    // ── 1. Authenticate Request ─────────────────────────────────────────────
    const tokenUser = await getUserFromRequest(request);

    // ── 2. Rate Limiting (Stricter for Anonymous) ───────────────────────────
    const clientIp = getClientIp(request);
    const bucket = tokenUser ? RATE_LIMIT_BUCKETS.AI_AUTHED : RATE_LIMIT_BUCKETS.AI_ANON;
    const identifier = tokenUser ? `user:${tokenUser.userId}` : `ip:${clientIp}`;
    const rl = checkRateLimit(identifier, bucket);

    if (!rl.success) {
      return createRateLimitResponse(
        rl.reset,
        "AI query limit reached. Please wait a moment before sending another message."
      );
    }

    // ── 3. Validate Input ───────────────────────────────────────────────────
    const body = await request.json();
    const result = ChatMessageSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { message: validatedMessage, history, previousIntent, previousEntities } = result.data;
    message = validatedMessage.trim();

    // ── 4. Assemble Conversational Context ──────────────────────────────────
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
      history: history || [],
      previousIntent: previousIntent as CopilotContext["previousIntent"],
      previousEntities: previousEntities as CopilotContext["previousEntities"],
    };

    // ── 5. Process with Civic Copilot Engine ────────────────────────────────
    const copilotResult = await processCopilotMessage(message, context);

    return NextResponse.json(copilotResult);
  } catch (error: unknown) {
    safeLog.error("Civic Copilot Route Error:", error);

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
