import { NextResponse } from "next/server";
import db from "@/lib/db";
import { detectCivicClusters } from "@/lib/nlp/tfidf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const radiusParam = searchParams.get("radiusKm");
    const radiusKm = radiusParam ? parseFloat(radiusParam) : 2.5;

    const challenges = await db.challenge.findMany({
      where: { status: { not: "MERGED" } },
      select: {
        id: true,
        title: true,
        category: true,
        district: true,
        latitude: true,
        longitude: true,
        urgencyScore: true,
        status: true,
      },
    });

    const clusters = detectCivicClusters(challenges, radiusKm);

    return NextResponse.json({
      totalChallengesAnalyzed: challenges.length,
      clustersFound: clusters.length,
      clusters,
    });
  } catch (error: unknown) {
    console.error("Clusters API Error:", error);
    return NextResponse.json({ error: "Failed to detect civic clusters" }, { status: 500 });
  }
}
