import { NextResponse } from "next/server";
import db from "@/lib/db";
import { evaluateDuplicates } from "@/lib/nlp/tfidf";

export async function POST(request: Request) {
  try {
    const { title, description, district, category, excludeId } = await request.json();

    if (!title || title.trim().length < 4) {
      return NextResponse.json({ duplicates: [] });
    }

    // Fetch existing active challenges (excluding merged ones or self)
    const existingChallenges = await db.challenge.findMany({
      where: {
        id: excludeId ? { not: excludeId } : undefined,
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
    });

    const candidates = evaluateDuplicates(
      {
        title,
        description: description || "",
        district,
        category,
      },
      existingChallenges,
      0.45 // 45% threshold
    );

    return NextResponse.json({
      hasDuplicates: candidates.length > 0,
      candidates,
    });
  } catch (error: unknown) {
    console.error("Duplicate Check Error:", error);
    return NextResponse.json({ error: "Failed to perform duplicate check" }, { status: 500 });
  }
}
