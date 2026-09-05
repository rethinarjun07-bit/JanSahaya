import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: solutionId } = params;
    const session = await getUserFromRequest(request);

    let endorserId = session?.userId;
    let endorserName = session?.name || "Govt & Industry Panel";

    if (!endorserId) {
      const demoAdmin = await db.user.findFirst({ where: { role: "ADMIN" } });
      endorserId = demoAdmin?.id;
      endorserName = demoAdmin?.name || "Govt Nodal Authority";
    }

    const { status, remarks, grantPledge } = await request.json();

    const solution = await db.solution.findUnique({
      where: { id: solutionId },
      include: { author: true, challenge: true },
    });

    if (!solution) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    const updated = await db.solution.update({
      where: { id: solutionId },
      data: {
        govtEndorsed: true,
        endorsedBy: endorserName,
        endorsedAt: new Date(),
        status: status || "GOVT_VERIFIED",
      },
    });

    // Award bonus karma to solution author
    await db.user.update({
      where: { id: solution.authorId },
      data: {
        karmaPoints: { increment: 150 },
      },
    });

    // If fully verified / deployed, mark challenge as SOLVED
    if (status === "DEPLOYED" || status === "GOVT_VERIFIED") {
      await db.challenge.update({
        where: { id: solution.challengeId },
        data: { status: "SOLVED" },
      });
    }

    // Create Notification
    await db.notification.create({
      data: {
        userId: solution.authorId,
        title: "Official Solution Endorsement",
        message: `Congratulations! Your solution '${solution.title}' has been officially endorsed by ${endorserName}.`,
        type: "SUCCESS",
        link: `/solutions/${solution.id}`,
      },
    });

    // Create Audit Log
    await db.auditLog.create({
      data: {
        action: "SOLUTION_OFFICIALLY_ENDORSED",
        entityType: "Solution",
        entityId: solution.id,
        actorId: endorserId || "SYSTEM",
        actorName: endorserName,
        details: JSON.stringify({ remarks, grantPledge, status: updated.status }),
      },
    });

    return NextResponse.json({
      success: true,
      solution: updated,
      message: "Solution successfully endorsed.",
    });
  } catch (error: unknown) {
    console.error("Endorse Solution Error:", error);
    return NextResponse.json({ error: "Failed to endorse solution" }, { status: 500 });
  }
}
