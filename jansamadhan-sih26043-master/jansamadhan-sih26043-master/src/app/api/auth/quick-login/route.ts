import { NextResponse } from "next/server";
import db from "@/lib/db";
import { generateToken } from "@/lib/auth";
import { DEMO_ALLOWED_ROLES } from "@/lib/rbac";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge: 7 * 24 * 60 * 60,
};

const ROLE_EMAILS: Record<string, string> = {
  CITIZEN:  "citizen@demo.in",
  SOLVER:   "solver@demo.in",
  INDUSTRY: "industry@demo.in",
  // ADMIN intentionally excluded — requires real credentials
};

export async function POST(request: Request) {
  // ── Security Gate: Demo mode must be explicitly enabled ──────────────────
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json(
      { error: "Quick login is disabled. Please use /login with your credentials.", code: "DEMO_MODE_DISABLED" },
      { status: 403 }
    );
  }

  try {
    const { role } = await request.json();
    const roleKey = (role || "").toUpperCase();

    // ── Security: Block ADMIN from quick-login ────────────────────────────
    if (!DEMO_ALLOWED_ROLES.includes(roleKey as "CITIZEN" | "SOLVER" | "INDUSTRY")) {
      return NextResponse.json(
        {
          error: `Quick login does not support '${roleKey}'. Government Authority (ADMIN) accounts require official credentials. Allowed: ${DEMO_ALLOWED_ROLES.join(", ")}`,
          code: "DEMO_ROLE_RESTRICTED",
          allowedRoles: DEMO_ALLOWED_ROLES,
        },
        { status: 403 }
      );
    }

    const targetEmail = ROLE_EMAILS[roleKey];
    if (!targetEmail) {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: targetEmail } });
    if (!user) {
      return NextResponse.json({ error: "Demo user not found. Please run the seed script." }, { status: 404 });
    }

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
        avatar: user.avatar,
      },
      token,
    });

    response.cookies.set("jansahaya_token", token, COOKIE_OPTIONS);
    response.cookies.set("jansamadhan_token", token, COOKIE_OPTIONS);

    return response;
  } catch (error: unknown) {
    console.error("Quick Login Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
