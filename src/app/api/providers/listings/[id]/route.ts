// app/api/providers/listings/[id]/route.ts — provider edits/deletes own listing
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { getOrCreateProfile } from "@/lib/prisma/getOrCreateProfile";
import { geocodeListing } from "@/lib/geocode";

const ALLOWED_FIELDS = [
  "title", "description", "category", "ageMinMonths", "ageMaxMonths",
  "price", "pricePer", "address", "city", "scheduleNotes", "spotsTotal",
  "isPublished",
] as const;

type Params = { params: { id: string } };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    if (profile.role !== "PROVIDER")
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { profileId: profile.id },
    });
    if (!providerProfile)
      return NextResponse.json({ data: null, error: "Provider profile not found" }, { status: 404 });

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { providerProfileId: true },
    });
    if (!listing)
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    if (listing.providerProfileId !== providerProfile.id)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const data: Record<string, unknown> = { updatedAt: new Date() };
    for (const field of ALLOWED_FIELDS) {
      if (field in body) data[field] = body[field];
    }

    const updated = await prisma.listing.update({ where: { id: params.id }, data });

    // Re-geocode if address/city changed or listing was just published
    const needsGeocode = "address" in body || "city" in body || body.isPublished === true;
    if (needsGeocode) {
      geocodeListing(params.id).catch(err => {
        console.error("[PATCH /api/providers/listings/:id] geocode failed", err);
      });
    }

    return NextResponse.json({ data: updated, error: null });
  } catch (err) {
    console.error("[PATCH /api/providers/listings/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await getOrCreateProfile(user.id, user.email ?? "", user.user_metadata);
    if (profile.role !== "PROVIDER")
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { profileId: profile.id },
    });
    if (!providerProfile)
      return NextResponse.json({ data: null, error: "Provider profile not found" }, { status: 404 });

    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      select: { providerProfileId: true },
    });
    if (!listing)
      return NextResponse.json({ data: null, error: "Not found" }, { status: 404 });
    if (listing.providerProfileId !== providerProfile.id)
      return NextResponse.json({ data: null, error: "Forbidden" }, { status: 403 });

    await prisma.listing.delete({ where: { id: params.id } });
    return NextResponse.json({ data: { id: params.id }, error: null });
  } catch (err) {
    console.error("[DELETE /api/providers/listings/:id]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
