// app/api/providers/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { providerRepo } from "@/lib/prisma/repositories";

type Params = { params: { id: string } };

async function authenticate() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const provider = await providerRepo.findById(params.id);
    if (!provider) return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    return NextResponse.json({ data: provider, error: null });
  } catch (err) {
    console.error("[GET /api/providers/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
    const existing = await providerRepo.findById(params.id);
    if (!existing || !profile || existing.profileId !== profile.id)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const allowedFields = ["businessName", "description", "address", "city", "phone", "website", "logoUrl"];
    const data: Record<string, any> = { updatedAt: new Date() };
    for (const field of allowedFields) {
      if (field in body) data[field] = body[field];
    }

    const provider = await providerRepo.update(params.id, data);
    return NextResponse.json({ data: provider, error: null });
  } catch (err) {
    console.error("[PATCH /api/providers/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const user = await authenticate();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    // Verify ownership
    const profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
    const existing = await providerRepo.findById(params.id);
    if (!existing || !profile || existing.profileId !== profile.id)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    await providerRepo.delete(params.id);
    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    console.error("[DELETE /api/providers/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
