// app/api/providers/route.ts
// GET  /api/providers          — get the current user's provider profile
// POST /api/providers          — create a new provider profile

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";
import { providerRepo } from "@/lib/prisma/repositories";

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const provider = await providerRepo.findByProfileId(profile.id);
    if (!provider) return NextResponse.json({ error: "Provider not found" }, { status: 404 });

    return NextResponse.json({ data: provider });
  } catch (err) {
    console.error("[GET /api/providers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { supabaseId: user.id },
    });
    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const body = await request.json();
    const { businessName, description, address, city, phone, website } = body;

    if (!businessName) {
      return NextResponse.json(
        { error: "businessName is required" },
        { status: 400 }
      );
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

    return NextResponse.json({ data: provider }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/providers]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
