// app/api/listings/[id]/route.ts — PATCH / DELETE (provider only)
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileRepo, listingRepo } from "@/lib/prisma/repositories";

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await profileRepo.findBySupabaseId(user.id);
    if (!profile || profile.role !== "PROVIDER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const listing = await listingRepo.update(params.id, body);
    return NextResponse.json({ data: listing });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await profileRepo.findBySupabaseId(user.id);
    if (!profile || profile.role !== "PROVIDER")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await listingRepo.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
