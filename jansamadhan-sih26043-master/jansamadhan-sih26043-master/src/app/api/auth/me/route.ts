import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getUserFromRequest(request);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organization: true,
        designation: true,
        district: true,
        state: true,
        skills: true,
        karmaPoints: true,
        badges: true,
        avatar: true,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        ...user,
        skills: user.skills ? JSON.parse(user.skills) : [],
        badges: user.badges ? JSON.parse(user.badges) : [],
      },
    });
  } catch (error: unknown) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null });
  }
}
