import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";
import { CSRPledgeSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    let userId = session?.userId;
    if (!userId) {
      const defaultIndustry = await db.user.findFirst({ where: { role: "INDUSTRY" } });
      userId = defaultIndustry?.id || "anonymous-industry";
    }

    const body = await request.json();
    const result = CSRPledgeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { challengeId, solutionId, funderName, amountPledged, notes } = result.data;

    let targetSolution = null;
    if (solutionId) {
      targetSolution = await db.solution.findUnique({ where: { id: solutionId } });
    } else {
      // Find top solution for this challenge
      targetSolution = await db.solution.findFirst({ where: { challengeId } });
    }

    if (targetSolution) {
      await db.solution.update({
        where: { id: targetSolution.id },
        data: {
          csrFundingStatus: "PLEDGED",
          csrFunderName: funderName,
          csrAmountPledged: amountPledged,
        },
      });
    }

    // Record Audit Log
    const user = await db.user.findUnique({ where: { id: userId } });
    await db.auditLog.create({
      data: {
        action: "CSR_FUNDING_PLEDGED",
        entityType: "Challenge",
        entityId: challengeId,
        actorId: userId,
        actorName: funderName || user?.name || "CSR Partner",
        details: JSON.stringify({
          funderName,
          amountPledged,
          solutionId: targetSolution?.id,
          notes,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `CSR Grant Pledge of ₹${(amountPledged / 100000).toFixed(1)} Lakhs by ${funderName} successfully committed for Challenge implementation.`,
      solution: targetSolution,
    });
  } catch (error: unknown) {
    console.error("CSR Pledge Error:", error);
    return NextResponse.json({ error: "Failed to process CSR pledge" }, { status: 500 });
  }
}
