import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: challengeId } = params;
    const comments = await db.comment.findMany({
      where: { challengeId },
      include: {
        user: { select: { id: true, name: true, role: true, organization: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ comments });
  } catch (error: unknown) {
    console.error("Fetch Comments Error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: challengeId } = params;
    const session = await getUserFromRequest(request);

    let userId = session?.userId;
    if (!userId) {
      const demoUser = await db.user.findFirst({ where: { role: "CITIZEN" } });
      if (!demoUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      userId = demoUser.id;
    }

    const { content, audioUrl } = await request.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Comment content cannot be empty" }, { status: 400 });
    }

    const comment = await db.comment.create({
      data: {
        challengeId,
        userId,
        content: content.trim(),
        audioUrl,
      },
      include: {
        user: { select: { id: true, name: true, role: true, organization: true } },
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error: unknown) {
    console.error("Post Comment Error:", error);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
