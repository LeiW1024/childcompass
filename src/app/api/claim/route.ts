// app/api/claim/route.ts — Links an authenticated provider to an unclaimed ProviderProfile
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ data: null, error: "Unauthorized" }, { status: 401 });

    const { token } = await request.json();
    if (!token) return NextResponse.json({ data: null, error: "Token required" }, { status: 400 });

    // Find the unclaimed provider
    const provider = await prisma.providerProfile.findUnique({ where: { claimToken: token } });
    if (!provider) return NextResponse.json({ data: null, error: "Invalid claim token" }, { status: 404 });
    if (provider.isClaimed) return NextResponse.json({ data: null, error: "Already claimed" }, { status: 409 });

    // Find or create the user's profile
    let profile = await prisma.profile.findUnique({ where: { supabaseId: user.id } });
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          supabaseId: user.id,
          email: user.email!,
          fullName: user.user_metadata?.full_name ?? null,
          role: "PROVIDER",
        },
      });
    } else {
      // Upgrade role to PROVIDER if needed
      await prisma.profile.update({
        where: { id: profile.id },
        data: { role: "PROVIDER", updatedAt: new Date() },
      });
    }

    // Check this user doesn't already have a different provider profile
    const existing = await prisma.providerProfile.findUnique({ where: { profileId: profile.id } });
    if (existing && existing.id !== provider.id) {
      return NextResponse.json({ data: null, error: "You already have a provider profile" }, { status: 409 });
    }

    // Claim: link provider profile to user
    await prisma.providerProfile.update({
      where: { id: provider.id },
      data: {
        profileId: profile.id,
        isClaimed: true,
        claimToken: null, // invalidate token after use
        updatedAt: new Date(),
      },
    });

    // Publish all seeded listings for this provider
    await prisma.listing.updateMany({
      where: { providerProfileId: provider.id, isAdminSeeded: true },
      data: { isPublished: true },
    });

    return NextResponse.json({ data: { claimed: true }, error: null });
  } catch (err) {
    console.error("[POST /api/claim]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
