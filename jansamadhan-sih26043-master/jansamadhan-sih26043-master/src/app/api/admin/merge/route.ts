import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { DuplicateMergeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Only Authorized Government Authorities (ADMIN) can execute challenge mergers.",
          code: "AUTHORITY_REQUIRED",
        },
        { status: 403 }
      );
    }
    const adminId = session.userId;

    const body = await request.json();
    const result = DuplicateMergeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { masterChallengeId, duplicateChallengeId, reason } = result.data;

    if (masterChallengeId === duplicateChallengeId) {
      return NextResponse.json({ error: "Cannot merge a challenge into itself." }, { status: 400 });
    }

    const master = await db.challenge.findUnique({ where: { id: masterChallengeId } });
    const duplicate = await db.challenge.findUnique({ where: { id: duplicateChallengeId } });

    if (!master || !duplicate) {
      return NextResponse.json({ error: "Master or duplicate challenge not found" }, { status: 404 });
    }

    // 1. Update duplicate challenge
    await db.challenge.update({
      where: { id: duplicateChallengeId },
      data: {
        status: "MERGED",
        masterChallengeId: masterChallengeId,
        officialNotes: `Merged into Master Challenge #${masterChallengeId}. Reason: ${reason}`,
      },
    });

    // 2. Mark master challenge as master and update urgency if duplicate was more urgent
    await db.challenge.update({
      where: { id: masterChallengeId },
      data: {
        isMaster: true,
        urgencyScore: Math.max(master.urgencyScore, duplicate.urgencyScore),
      },
    });

    // 3. Roll up comments from duplicate to master
    await db.comment.updateMany({
      where: { challengeId: duplicateChallengeId },
      data: { challengeId: masterChallengeId },
    });

    // 4. Create DuplicateMerge Record
    const mergeRecord = await db.duplicateMerge.create({
      data: {
        masterChallengeId,
        duplicateChallengeId,
        similarityScore: body.similarityScore || 0.88,
        reason,
        mergedById: adminId,
      },
    });

    // 5. Create Audit Log
    const adminUser = await db.user.findUnique({ where: { id: adminId } });
    await db.auditLog.create({
      data: {
        action: "DUPLICATE_CHALLENGES_MERGED",
        entityType: "Challenge",
        entityId: masterChallengeId,
        actorId: adminId,
        actorName: adminUser?.name || "Disaster Officer",
        details: JSON.stringify({
          masterTitle: master.title,
          duplicateTitle: duplicate.title,
          reason,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully merged duplicate challenge into Master #${master.id}`,
      mergeRecord,
    });
  } catch (error: unknown) {
    console.error("Merge API Error:", error);
    return NextResponse.json({ error: "Failed to merge challenges" }, { status: 500 });
  }
}
