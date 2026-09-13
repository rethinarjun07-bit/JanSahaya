import { NextResponse } from "next/server";
import db from "@/lib/db";
import { evaluateDuplicates } from "@/lib/nlp/tfidf";
import { getClientIp, checkRateLimit, createRateLimitResponse, RATE_LIMIT_BUCKETS } from "@/lib/rate-limiter";
import { safeLog } from "@/lib/safe-logger";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const rl = checkRateLimit(clientIp, RATE_LIMIT_BUCKETS.SEARCH);
    if (!rl.success) {
      return createRateLimitResponse(rl.reset, "Duplicate check query limit exceeded. Please wait.");
    }

    const body = await request.json();
    const { title, description, district, category, excludeId } = body;

    if (!title || typeof title !== "string" || title.trim().length < 4) {
      return NextResponse.json({ duplicates: [], candidates: [], hasDuplicates: false });
    }

    // Bound input lengths
    const safeTitle = title.trim().slice(0, 200);
    const safeDescription = typeof description === "string" ? description.trim().slice(0, 5000) : "";
    const safeDistrict = typeof district === "string" ? district.trim().slice(0, 100) : undefined;
    const safeCategory = typeof category === "string" ? category.trim().slice(0, 100) : undefined;
    const safeExcludeId = typeof excludeId === "string" ? excludeId.trim().slice(0, 100) : undefined;

    // Fetch existing active challenges (excluding merged ones or self)
    const existingChallenges = await db.challenge.findMany({
      where: {
        id: safeExcludeId ? { not: safeExcludeId } : undefined,
        status: { not: "MERGED" },
      },
      select: {
        id: true,
        title: true,
        description: true,
        district: true,
        category: true,
        severity: true,
        status: true,
        createdAt: true,
      },
      take: 100, // Bound search scope to prevent query bloat
    });

    const candidates = evaluateDuplicates(
      {
        title: safeTitle,
        description: safeDescription,
        district: safeDistrict,
        category: safeCategory,
      },
      existingChallenges,
      0.45 // 45% threshold
    );

    return NextResponse.json({
      hasDuplicates: candidates.length > 0,
      candidates,
    });
  } catch (error: unknown) {
    safeLog.error("Duplicate Check Error:", error);
    return NextResponse.json({ error: "Failed to perform duplicate check" }, { status: 500 });
  }
}
