import { NextResponse } from "next/server";
import db from "@/lib/db";
import { matchCSRPartners } from "@/lib/nlp/matcher";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get("challengeId");

    if (!challengeId) {
      return NextResponse.json({ error: "challengeId is required" }, { status: 400 });
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
