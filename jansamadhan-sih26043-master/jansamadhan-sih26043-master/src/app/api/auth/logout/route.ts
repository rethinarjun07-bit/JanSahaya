import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.set("jansahaya_token", "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("jansamadhan_token", "", {
    httpOnly: false,
    path: "/",
    maxAge: 0,
  });
  return response;
}
