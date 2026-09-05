import { NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginSchema } from "@/lib/validators";

// Secure cookie options shared across auth routes
const COOKIE_OPTIONS = {
  httpOnly: true,       // Not accessible via JavaScript — prevents XSS token theft
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,  // Prevents CSRF
  path: "/",
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Return same error for both invalid email and wrong password (prevent user enumeration)
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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

    // Set HttpOnly cookies — tokens are NOT accessible from JS, reducing XSS attack surface
    response.cookies.set("jansahaya_token", token, COOKIE_OPTIONS);
    response.cookies.set("jansamadhan_token", token, COOKIE_OPTIONS);

    return response;
  } catch (error: unknown) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
