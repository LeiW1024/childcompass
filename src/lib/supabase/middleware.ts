// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/supabase";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admin: protect with HMAC token (cookie) or raw key (header)
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const secret = process.env.ADMIN_SECRET_KEY ?? "";
    const headerKey = request.headers.get("x-admin-key");
    const cookieToken = request.cookies.get("admin_key")?.value;

    let authenticated = false;
    if (secret) {
      // Compute expected HMAC token using Web Crypto API (Edge-compatible)
      const encoder = new TextEncoder();
      const key = await globalThis.crypto.subtle.importKey(
        "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
      );
      const sig = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode("admin-session"));
      const expectedToken = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");

      if (cookieToken && cookieToken === expectedToken) {
        authenticated = true;
      } else if (headerKey && headerKey === secret) {
        authenticated = true;
      }
    }

    if (!authenticated) {
      if (pathname === "/admin/login") return supabaseResponse;
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
