import { NextResponse } from "next/server";
import db from "@/lib/db";
import { matchCSRPartners } from "@/lib/nlp/matcher";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      // Global mode: Return CSR opportunities across verified challenges
      const verifiedChallenges = await db.challenge.findMany({
        where: { status: { in: ["VERIFIED", "ASSIGNED", "IN_PROGRESS"] } },
        orderBy: { urgencyScore: "desc" },
        take: 10,
      });

      const opportunities = verifiedChallenges.map((c) => ({
        challengeId: c.id,
        challengeTitle: c.title,
        district: c.district,
        category: c.category,
        urgencyScore: c.urgencyScore,
        matches: matchCSRPartners({
          category: c.category,
          district: c.district,
          urgencyScore: c.urgencyScore,
        }),
      }));

      return NextResponse.json({
        total: opportunities.length,
        opportunities,
      });
    }

    const challenge = await db.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const matches = matchCSRPartners({
      category: challenge.category,
      district: challenge.district,
      urgencyScore: challenge.urgencyScore,
    });

    return NextResponse.json({
      challengeId,
      challengeTitle: challenge.title,
      matches,
    });
  } catch (error: unknown) {
    console.error("CSR Matches Error:", error);
    return NextResponse.json({ error: "Failed to calculate CSR matches" }, { status: 500 });
  }
}
