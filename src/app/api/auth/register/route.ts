import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validators";
import { SELF_REGISTERABLE_ROLES } from "@/lib/rbac";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // ── Security: ADMIN accounts cannot be self-registered via public endpoint ──
    // ADMIN accounts are created only via the seed script or secure internal tools.
    if (!SELF_REGISTERABLE_ROLES.includes(data.role as "CITIZEN" | "SOLVER" | "INDUSTRY")) {
      return NextResponse.json(
        {
          error: "Invalid role. Government Authority accounts are provisioned separately and cannot be self-registered.",
          code: "ROLE_NOT_ALLOWED",
          allowedRoles: SELF_REGISTERABLE_ROLES,
        },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await db.user.create({
      data: {
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: data.role,
        organization: data.organization,
        designation: data.designation,
        phone: data.phone,
        district: data.district,
        state: data.state || "Jharkhand",
        skills: data.skills ? JSON.stringify(data.skills) : null,
        bio: data.bio,
        karmaPoints: data.role === "SOLVER" ? 150 : 100,
        badges: JSON.stringify([
          { id: "new_member", name: "JanSahaya Member", icon: "UserCheck", date: new Date().toISOString() },
        ]),
        isVerified: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organization: user.organization || undefined,
      district: user.district || undefined,
    };

    const token = generateToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        designation: user.designation,
        district: user.district,
        state: user.state,
        karmaPoints: user.karmaPoints,
      },
      token,
    });

    response.cookies.set("jansamadhan_token", token, COOKIE_OPTIONS);
    response.cookies.set("jansahaya_token", token, COOKIE_OPTIONS);

    return response;
  } catch (error: unknown) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
