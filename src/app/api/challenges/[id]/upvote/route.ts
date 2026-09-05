import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

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

    const existing = await db.upvote.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId,
        },
      },
    });

    if (existing) {
      // Remove upvote (toggle off)
      await db.upvote.delete({
        where: { id: existing.id },
      });
      const count = await db.upvote.count({ where: { challengeId } });
      return NextResponse.json({ upvoted: false, count });
    } else {
      // Add upvote
      await db.upvote.create({
        data: {
          userId,
          challengeId,
        },
      });

      // Award karma to creator
      const chal = await db.challenge.findUnique({ where: { id: challengeId } });
      if (chal) {
        await db.user.update({
          where: { id: chal.createdById },
          data: { karmaPoints: { increment: 5 } },
        });
      }

      const count = await db.upvote.count({ where: { challengeId } });
      return NextResponse.json({ upvoted: true, count });
    }
  } catch (error: unknown) {
    console.error("Upvote Error:", error);
    return NextResponse.json({ error: "Failed to process upvote" }, { status: 500 });
  }
}
