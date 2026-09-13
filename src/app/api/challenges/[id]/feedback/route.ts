import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { CitizenFeedbackSchema } from "@/lib/validators";
import { getClientIp, checkRateLimit, createRateLimitResponse, RATE_LIMIT_BUCKETS } from "@/lib/rate-limiter";
import { safeLog } from "@/lib/safe-logger";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getUserFromRequest(request);
    const clientIp = getClientIp(request);
    const identifier = session ? `user:${session.userId}` : `ip:${clientIp}`;

    const rl = checkRateLimit(identifier, RATE_LIMIT_BUCKETS.INTERACTION);
    if (!rl.success) {
      return createRateLimitResponse(rl.reset, "Feedback submission limit reached. Please wait.");
    }

    let userId = session?.userId;
    if (!userId) {
      const isDemo = process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
      if (!isDemo) {
        return NextResponse.json(
          { error: "Authentication required to submit resolution feedback.", code: "AUTH_REQUIRED" },
          { status: 401 }
        );
      }
      const defaultCitizen = await db.user.findFirst({ where: { role: "CITIZEN" } });
      userId = defaultCitizen?.id || "anonymous-citizen";
    }

    const body = await request.json();
    const result = CitizenFeedbackSchema.safeParse({
      ...body,
      challengeId: params.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { challengeId, feedback, notes, satisfactionRating } = result.data;

    const challenge = await db.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let newStatus = challenge.status;
    let newSlaStatus = challenge.slaStatus;
    let impactScore = challenge.impactScore || 80;

    if (feedback === "SOLVED") {
      newStatus = "SOLVED";
      newSlaStatus = "ON_TRACK";
      impactScore = Math.min(98, (satisfactionRating || 5) * 20);
    } else if (feedback === "NOT_SOLVED") {
      // Reopen and escalate!
      newStatus = "ESCALATED";
      newSlaStatus = "ESCALATED";
      impactScore = Math.max(20, impactScore - 30);
    } else {
      // PARTIALLY_SOLVED
      newStatus = "IN_PROGRESS";
    }

    const updatedChallenge = await db.challenge.update({
      where: { id: challengeId },
      data: {
        citizenFeedback: feedback,
        citizenFeedbackNotes: notes || null,
        status: newStatus,
        slaStatus: newSlaStatus,
        impactScore,
      },
    });

    // Record Audit Log
    const user = await db.user.findUnique({ where: { id: userId } });
    await db.auditLog.create({
      data: {
        action: feedback === "NOT_SOLVED" ? "CITIZEN_REOPEN_ESCALATION" : "CITIZEN_RESOLUTION_FEEDBACK",
        entityType: "Challenge",
        entityId: challengeId,
        actorId: userId,
        actorName: user?.name || "Verified Citizen",
        details: JSON.stringify({
          feedback,
          notes,
          satisfactionRating,
          previousStatus: challenge.status,
          newStatus,
        }),
      },
    });

    // If citizen verified problem solved, award karma to solvers and citizens
    if (feedback === "SOLVED") {
      await db.user.update({
        where: { id: challenge.createdById },
        data: { karmaPoints: { increment: 50 } },
      });
    }

    return NextResponse.json({
      success: true,
      message:
        feedback === "NOT_SOLVED"
          ? "Feedback recorded. Due to citizen report of incomplete resolution, the challenge has been escalated and reopened for administrative review."
          : "Citizen feedback recorded successfully. Thank you for verifying civic resolution on the ground!",
      challenge: updatedChallenge,
    });
  } catch (error: unknown) {
    safeLog.error("Citizen Feedback Error:", error);
    return NextResponse.json({ error: "Failed to submit citizen feedback" }, { status: 500 });
  }
}
