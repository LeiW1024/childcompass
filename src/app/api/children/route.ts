// app/api/children/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const children = await prisma.child.findMany({
      where: { parentId: profile.id },
      orderBy: { firstName: "asc" },
    });
    return NextResponse.json({ data: children, error: null });
  } catch (err) {
    console.error("[GET /api/children]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ data: null, error: "Invalid request" }, { status: 400 });

    const { firstName, dateOfBirth } = body;
    if (!firstName?.trim()) return NextResponse.json({ data: null, error: "First name required" }, { status: 400 });
    if (!dateOfBirth) return NextResponse.json({ data: null, error: "Date of birth required" }, { status: 400 });

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return NextResponse.json({ data: null, error: "Invalid date" }, { status: 400 });

    const child = await prisma.child.create({
      data: { firstName: firstName.trim(), dateOfBirth: dob, parentId: profile.id },
    });
    return NextResponse.json({ data: child, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/children]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
