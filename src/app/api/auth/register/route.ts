import { NextResponse } from "next/server";
import db from "@/lib/db";
import { hashPassword, generateToken, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { RegisterSchema } from "@/lib/validators";
import { SELF_REGISTERABLE_ROLES } from "@/lib/rbac";
import { getClientIp, checkRateLimit, createRateLimitResponse, RATE_LIMIT_BUCKETS } from "@/lib/rate-limiter";
import { safeLog } from "@/lib/safe-logger";

export async function POST(request: Request) {
  try {
    // ── 1. Rate Limiting Check ──────────────────────────────────────────────
    const clientIp = getClientIp(request);
    const rl = checkRateLimit(clientIp, RATE_LIMIT_BUCKETS.AUTH);
    if (!rl.success) {
      return createRateLimitResponse(
        rl.reset,
        "Too many registration attempts. Please try again later."
      );
    }

    // ── 2. Input Validation ────────────────────────────────────────────────
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // ── 3. Role Security Gate ──────────────────────────────────────────────
    // ADMIN accounts cannot be self-registered via public endpoint
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
    });

    response.cookies.set("jansahaya_token", token, AUTH_COOKIE_OPTIONS);

    return response;
  } catch (error: unknown) {
    safeLog.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
