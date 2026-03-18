// app/api/providers/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { providerRepo } from "@/lib/prisma/repositories";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
    });
    if (!profile) return NextResponse.json({ data: null, error: "Profile not found" }, { status: 404 });

    const provider = await providerRepo.findByProfileId(profile.id);
    if (!provider) return NextResponse.json({ data: null, error: "Provider not found" }, { status: 404 });

    return NextResponse.json({ data: provider, error: null });
  } catch (err) {
    console.error("[GET /api/providers]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
    });
    if (!profile) return NextResponse.json({ data: null, error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const { businessName, description, address, city, phone, website } = body;

    if (!businessName) {
      return NextResponse.json({ data: null, error: "businessName is required" }, { status: 400 });
    }

    const provider = await providerRepo.create({
      businessName,
      description,
      address,
      city,
      phone,
      website,
      profile: { connect: { id: profile.id } },
    });

    return NextResponse.json({ data: provider, error: null }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/providers]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
