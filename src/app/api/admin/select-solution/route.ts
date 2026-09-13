import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { SolutionSelectionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden: Only Authorized Government Authorities can select and endorse the implementation solution.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = SolutionSelectionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { challengeId, selectedSolutionId, governmentDecisionReason } = result.data;

    const challenge = await db.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    const solution = await db.solution.findUnique({
      where: { id: selectedSolutionId },
      include: { author: true },
    });
    if (!solution) {
      return NextResponse.json({ error: "Solution proposal not found" }, { status: 404 });
    }

    // 1. Update Solution endorsement
    await db.solution.update({
      where: { id: selectedSolutionId },
      data: {
        govtEndorsed: true,
        endorsedBy: session.userId,
        endorsedAt: new Date(),
        status: "GOVT_VERIFIED",
        milestoneStage: "Phase 2: Approved for Implementation",
      },
    });

    // 2. Update Challenge status to IN_PROGRESS and link selected solution
    const updatedChallenge = await db.challenge.update({
      where: { id: challengeId },
      data: {
        selectedSolutionId,
        status: "IN_PROGRESS",
      },
    });

    // 3. Record Audit Log for Government Decision
    const adminUser = await db.user.findUnique({ where: { id: session.userId } });
    await db.auditLog.create({
      data: {
        action: "GOVERNMENT_SOLUTION_SELECTED",
        entityType: "Solution",
        entityId: selectedSolutionId,
        actorId: session.userId,
        actorName: adminUser?.name || "State Nodal Officer",
        details: JSON.stringify({
          challengeId,
          solutionTitle: solution.title,
          teamName: solution.teamName,
          decisionReason: governmentDecisionReason,
          budgetEstimate: solution.budgetEstimate,
        }),
      },
    });

    // 4. Notify Solution Author
    await db.notification.create({
      data: {
        userId: solution.authorId,
        title: "Proposal Selected for Implementation!",
        message: `Your technical proposal '${solution.title}' has been officially selected by the Government of Jharkhand for Challenge #${challengeId.substring(0, 8)}.`,
        type: "SUCCESS",
        link: `/solutions/${solution.id}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Solution officially selected and endorsed by Government.",
      challenge: updatedChallenge,
    });
  } catch (error: unknown) {
    console.error("Select Solution Error:", error);
    return NextResponse.json({ error: "Failed to process solution selection" }, { status: 500 });
  }
}
