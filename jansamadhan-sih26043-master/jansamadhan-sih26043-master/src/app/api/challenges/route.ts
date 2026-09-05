import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { ChallengeSchema } from "@/lib/validators";
import { classifyChallenge } from "@/lib/nlp/classifier";
import { evaluateDuplicates } from "@/lib/nlp/tfidf";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const district = searchParams.get("district") || "";
    const state = searchParams.get("state") || "";
    const category = searchParams.get("category") || "";
    const severity = searchParams.get("severity") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { district: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (district && district !== "All Districts") {
      where.district = district;
    }

    if (state && state !== "All States") {
      where.state = state;
    }

    if (category && category !== "All Categories") {
      where.category = category;
    }

    if (severity && severity !== "All Severities") {
      where.severity = severity;
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const challenges = await db.challenge.findMany({
      where,
      orderBy: [{ urgencyScore: "desc" }, { createdAt: "desc" }],
      include: {
        createdBy: {
          select: { id: true, name: true, role: true, organization: true },
        },
        _count: {
          select: { solutions: true, upvotes: true, comments: true, duplicates: true },
        },
      },
    });

    return NextResponse.json({
      challenges: challenges.map((c) => ({
        ...c,
        aiTags: c.aiTags ? JSON.parse(c.aiTags) : [],
        mediaUrls: c.mediaUrls ? JSON.parse(c.mediaUrls) : [],
      })),
      total: challenges.length,
    });
  } catch (error: unknown) {
    console.error("Fetch Challenges Error:", error);
    return NextResponse.json({ error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    let creatorId = session?.userId;

    if (!creatorId) {
      // Fallback to demo citizen user if not logged in
      const defaultCitizen = await db.user.findFirst({ where: { role: "CITIZEN" } });
      if (!defaultCitizen) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      creatorId = defaultCitizen.id;
    }

    const body = await request.json();
    const result = ChallengeSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = Object.entries(result.error.flatten().fieldErrors)
        .map(([field, msgs]) => Array.isArray(msgs) ? msgs.join(", ") : msgs)
        .filter(Boolean)
        .join(". ");
      return NextResponse.json(
        {
          error: fieldErrors ? `Validation failed: ${fieldErrors}` : "Validation failed",
          details: result.error.flatten()
        },
        { status: 400 }
      );
    }

    const data = result.data;

    // Run NLP Classifier
    const classification = classifyChallenge(data.title, data.description);

    // Fetch existing challenges to run duplicate detection
    const existingChallenges = await db.challenge.findMany({
      select: { id: true, title: true, description: true, district: true, category: true },
    });

    const duplicateCandidates = evaluateDuplicates(
      {
        title: data.title,
        description: data.description,
        district: data.district,
        category: data.category,
      },
      existingChallenges,
      0.65
    );

    // Check if university matches
    const matchedUni = await db.university.findFirst({
      where: { code: classification.recommendedUniversity.code },
    });

    const newChallenge = await db.challenge.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category || classification.predictedCategory,
        severity: data.severity || classification.severity,
        urgencyScore: classification.urgencyScore,
        status: "SUBMITTED",
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
        mediaUrls: data.mediaUrls ? JSON.stringify(data.mediaUrls) : null,
        audioUrl: data.audioUrl,
        voiceTranscript: data.voiceTranscript,
        language: data.language || "en",
        aiTags: JSON.stringify(data.aiTags && data.aiTags.length > 0 ? data.aiTags : classification.tags),
        predictedSector: classification.predictedCategory,
        autoAssignedUniversity: classification.recommendedUniversity.name,
        assignedUniversityId: matchedUni ? matchedUni.id : null,
        createdById: creatorId,
      },
    });

    // Create Audit Log
    const creatorUser = await db.user.findUnique({ where: { id: creatorId } });
    await db.auditLog.create({
      data: {
        action: "CHALLENGE_CREATED",
        entityType: "Challenge",
        entityId: newChallenge.id,
        actorId: creatorId,
        actorName: creatorUser?.name || "Citizen Reporter",
        details: JSON.stringify({
          severity: newChallenge.severity,
          urgencyScore: newChallenge.urgencyScore,
          duplicateWarningCount: duplicateCandidates.length,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      challenge: {
        ...newChallenge,
        aiTags: JSON.parse(newChallenge.aiTags || "[]"),
      },
      duplicatesDetected: duplicateCandidates,
    });
  } catch (error: unknown) {
    console.error("Create Challenge Error:", error);
    return NextResponse.json({ error: "Failed to create challenge" }, { status: 500 });
  }
}
