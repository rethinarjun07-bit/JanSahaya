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
  // NOTE: ADMIN is intentionally NOT listed here — ADMIN requires real credentials via /login
};

export async function POST(request: Request) {
  // ── Security Gate: Demo mode must be explicitly enabled ──────────────────
  if (process.env.DEMO_MODE !== "true") {
    return NextResponse.json(
      {
        error: "Demo mode is disabled on this deployment.",
        code: "DEMO_MODE_DISABLED",
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const roleKey = (body.role || "").toUpperCase();

    // ── Security: Block ADMIN role from demo-switch ───────────────────────
    if (!DEMO_ALLOWED_ROLES.includes(roleKey as "CITIZEN" | "SOLVER" | "INDUSTRY")) {
      return NextResponse.json(
        {
          error: `Demo mode does not allow switching to '${roleKey}'. Government Authority (ADMIN) accounts require official credentials via /login. Allowed demo roles: ${DEMO_ALLOWED_ROLES.join(", ")}`,
          code: "DEMO_ROLE_RESTRICTED",
          allowedRoles: DEMO_ALLOWED_ROLES,
        },
        { status: 403 }
      );
    }

    const targetEmail = ROLE_EMAILS[roleKey];
    if (!targetEmail) {
      return NextResponse.json(
        { error: `Invalid demo role: ${body.role}.` },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email: targetEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "Demo persona not found. Please run the seed script." },
        { status: 404 }
      );
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
    const userData = {
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
    };

    const response = NextResponse.json({ success: true, user: userData, token });
    response.cookies.set("jansahaya_token", token, COOKIE_OPTIONS);
    response.cookies.set("jansamadhan_token", token, COOKIE_OPTIONS);

    return response;
  } catch (error: unknown) {
    console.error("Demo Switch Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
