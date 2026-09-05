import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const solution = await db.solution.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, organization: true, designation: true, role: true, karmaPoints: true, avatar: true },
        },
        challenge: {
          include: {
            createdBy: { select: { id: true, name: true, district: true } },
          },
        },
        milestones: {
          orderBy: { order: "asc" },
        },
        reviews: {
          include: {
            reviewer: { select: { id: true, name: true, role: true, organization: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true, organization: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { upvotes: true, comments: true },
        },
      },
    });

    if (!solution) {
      return NextResponse.json({ error: "Solution not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...solution,
      techStack: solution.techStack ? JSON.parse(solution.techStack) : [],
      mediaUrls: solution.mediaUrls ? JSON.parse(solution.mediaUrls) : [],
    });
  } catch (error: unknown) {
    console.error("Fetch Single Solution Error:", error);
    return NextResponse.json({ error: "Failed to fetch solution" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getUserFromRequest(request);
    const body = await request.json();

    // If updating a milestone status
    if (body.milestoneId && body.milestoneStatus) {
      await db.milestone.update({
        where: { id: body.milestoneId },
        data: {
          status: body.milestoneStatus,
          notes: body.notes,
          proofUrl: body.proofUrl,
          updatedAt: new Date(),
        },
      });
    }

    const updated = await db.solution.update({
      where: { id },
      data: {
        status: body.status,
        milestoneStage: body.milestoneStage,
        govtEndorsed: body.govtEndorsed,
        endorsedBy: body.endorsedBy,
        endorsedAt: body.govtEndorsed ? new Date() : undefined,
      },
      include: { milestones: true },
    });

    if (session) {
      await db.auditLog.create({
        data: {
          action: "SOLUTION_PROGRESS_UPDATED",
          entityType: "Solution",
          entityId: id,
          actorId: session.userId,
          actorName: session.name,
          details: JSON.stringify({ status: body.status, milestoneStage: body.milestoneStage }),
        },
      });
    }

    return NextResponse.json({ success: true, solution: updated });
  } catch (error: unknown) {
    console.error("Update Solution Error:", error);
    return NextResponse.json({ error: "Failed to update solution" }, { status: 500 });
  }
}
