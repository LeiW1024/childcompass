// app/api/children/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    const child = await prisma.child.findFirst({ where: { id: params.id, parentId: profile.id } });
    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await prisma.child.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
