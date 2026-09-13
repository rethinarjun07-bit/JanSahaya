import { NextResponse } from "next/server";
import { AUTH_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("jansahaya_token", "", {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 0,
  });
  return response;
}
