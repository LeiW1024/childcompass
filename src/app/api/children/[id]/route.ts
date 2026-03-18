// app/api/children/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const child = await prisma.child.findFirst({ where: { id: params.id, parentId: profile.id } });
    if (!child) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    await prisma.child.delete({ where: { id: params.id } });
    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/children/id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
