// app/api/admin/auth/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  const { key } = await request.json();
  const expected = process.env.ADMIN_SECRET_KEY ?? "";

  // Constant-time comparison to prevent timing attacks
  const keyBuf = Buffer.from(key ?? "");
  const expectedBuf = Buffer.from(expected);
  if (keyBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(keyBuf, expectedBuf)) {
    return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
  }

  // Store a signed token instead of the raw secret
  const token = crypto.createHmac("sha256", expected).update("admin-session").digest("hex");
  const res = NextResponse.json({ data: { authenticated: true }, error: null });
  res.cookies.set("admin_key", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });
  return res;
}
