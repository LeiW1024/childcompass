// app/api/listings/route.ts — GET (public) / POST (provider only)
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { profileRepo, listingRepo } from "@/lib/prisma/repositories";
import type { ListingCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get("category") as ListingCategory) || undefined;
    const age = searchParams.get("age") ? parseInt(searchParams.get("age")!) : undefined;
    const listings = await listingRepo.findPublished({ category, ageMonths: age });
    return NextResponse.json({ data: listings, error: null });
  } catch (err) {
    console.error("[GET /api/listings]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await profileRepo.findBySupabaseId(user.id);
    if (!profile || profile.role !== "PROVIDER" || !profile.provider)
      return NextResponse.json({ data: null, error: "Provider account required" }, { status: 403 });

    const body = await request.json();
    const { title, description, category, ageMinMonths, ageMaxMonths, price, pricePer, address, city, scheduleNotes, spotsTotal } = body;

    if (!title || !description || !category || ageMinMonths == null || ageMaxMonths == null || !price || !pricePer)
      return NextResponse.json({ data: null, error: "Missing required fields" }, { status: 400 });

    const listing = await listingRepo.create({
      title, description, category, ageMinMonths, ageMaxMonths, price, pricePer,
      address, city, scheduleNotes, spotsTotal,
      isPublished: false,
      providerProfile: { connect: { id: profile.provider.id } },
    });

    return NextResponse.json({ data: listing, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/listings]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
