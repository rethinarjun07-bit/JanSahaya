import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Increment view count
    await db.challenge.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    const challenge = await db.challenge.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, role: true, organization: true, district: true, state: true, karmaPoints: true },
        },
        solutions: {
          include: {
            author: {
              select: { id: true, name: true, organization: true, role: true, karmaPoints: true, avatar: true },
            },
            milestones: {
              orderBy: { order: "asc" },
            },
            reviews: {
              include: {
                reviewer: { select: { id: true, name: true, role: true, organization: true } },
              },
            },
            _count: {
              select: { upvotes: true, comments: true },
            },
          },
        },
        duplicates: {
          select: { id: true, title: true, district: true, createdAt: true, status: true },
        },
        masterChallenge: {
          select: { id: true, title: true, district: true, status: true },
        },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true, organization: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        upvotes: {
          select: { userId: true },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...challenge,
      aiTags: challenge.aiTags ? JSON.parse(challenge.aiTags) : [],
      mediaUrls: challenge.mediaUrls ? JSON.parse(challenge.mediaUrls) : [],
    });
  } catch (error: unknown) {
    console.error("Fetch Single Challenge Error:", error);
    return NextResponse.json({ error: "Failed to fetch challenge" }, { status: 500 });
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

    const updated = await db.challenge.update({
      where: { id },
      data: {
        status: body.status,
        officialNotes: body.officialNotes,
        severity: body.severity,
        assignedUniversityId: body.assignedUniversityId,
        assignedDepartment: body.assignedDepartment,
        verifiedAt: body.status === "VERIFIED" ? new Date() : undefined,
        verifiedById: session?.userId,
      },
    });

    if (session) {
      await db.auditLog.create({
        data: {
          action: "CHALLENGE_UPDATED",
          entityType: "Challenge",
          entityId: id,
          actorId: session.userId,
          actorName: session.name,
          details: JSON.stringify({ status: body.status, notes: body.officialNotes }),
        },
      });
    }

    return NextResponse.json({ success: true, challenge: updated });
  } catch (error: unknown) {
    console.error("Update Challenge Error:", error);
    return NextResponse.json({ error: "Failed to update challenge" }, { status: 500 });
  }
}
