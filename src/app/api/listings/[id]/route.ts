// app/api/listings/[id]/route.ts — PATCH / DELETE (provider only, ownership verified)
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileRepo, listingRepo } from "@/lib/prisma/repositories";

type Params = { params: { id: string } };

// Fields a provider is allowed to update
const ALLOWED_FIELDS = [
  "title", "description", "category", "ageMinMonths", "ageMaxMonths",
  "price", "pricePer", "address", "city", "scheduleNotes", "spotsTotal",
  "maxParticipants", "datePeriods", "availableTimes", "imageUrl",
] as const;

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await profileRepo.findBySupabaseId(user.id);
    if (!profile || profile.role !== "PROVIDER" || !profile.provider)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    // Verify ownership
    const existing = await listingRepo.findById(params.id);
    if (!existing || existing.providerProfileId !== profile.provider.id)
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    // Allowlist fields to prevent mass assignment
    const body = await request.json();
    const safeData: Record<string, any> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) safeData[field] = body[field];
    }

    const listing = await listingRepo.update(params.id, safeData);
    return NextResponse.json({ data: listing, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await profileRepo.findBySupabaseId(user.id);
    if (!profile || profile.role !== "PROVIDER" || !profile.provider)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    // Verify ownership
    const existing = await listingRepo.findById(params.id);
    if (!existing || existing.providerProfileId !== profile.provider.id)
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });

    await listingRepo.delete(params.id);
    return NextResponse.json({ data: null, error: null });
  } catch (err) {
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
