// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type");
  const next       = searchParams.get("next") ?? "/dashboard";
  const error      = searchParams.get("error");
  const error_desc = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/error?message=${encodeURIComponent(error_desc ?? error)}`
    );
  }

  const supabase = createClient();

  if (code) {
    const { data, error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
    if (!exchErr && data.user) {
      const u = data.user;
      await getOrCreateProfile(u.id, u.email ?? "", u.user_metadata).catch(console.error);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] exchangeCodeForSession:", exchErr?.message);
  }

  if (token_hash && type) {
    const { data, error: otpErr } = await supabase.auth.verifyOtp({ token_hash, type: type as any });
    if (!otpErr && data.user) {
      const u = data.user;
      await getOrCreateProfile(u.id, u.email ?? "", u.user_metadata).catch(console.error);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] verifyOtp:", otpErr?.message);
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
