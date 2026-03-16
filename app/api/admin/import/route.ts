// app/api/admin/import/route.ts — Saves scraped providers + listings to DB
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { providers } = await request.json();
    if (!providers?.length) return NextResponse.json({ error: "No providers provided" }, { status: 400 });

    let imported = 0;

    for (const p of providers) {
      // Create ProviderProfile (unclaimed)
      const claimToken = crypto.randomBytes(24).toString("hex");

      const providerProfile = await prisma.providerProfile.create({
        data: {
          businessName: p.businessName,
          description:  p.description ?? null,
          address:      p.address ?? null,
          city:         p.city ?? "Erfurt",
          phone:        p.phone ?? null,
          website:      p.website ?? null,
          isClaimed:    false,
          isVerified:   false,
          claimToken,
          sourceUrl:    p.sourceUrl ?? null,
        },
      });

      // Create a listing for this provider
      await prisma.listing.create({
        data: {
          title:           p.businessName,
          description:     p.description ?? "No description available yet.",
          category:        p.category ?? "OTHER",
          ageMinMonths:    p.ageMinMonths ?? 0,
          ageMaxMonths:    p.ageMaxMonths ?? 72,
          price:           p.price ?? 0,
          pricePer:        p.pricePer ?? "MONTH",
          address:         p.address ?? null,
          city:            p.city ?? "Erfurt",
          scheduleNotes:   p.scheduleNotes ?? null,
          isPublished:     false, // admin reviews before publishing
          isAdminSeeded:   true,
          providerProfile: { connect: { id: providerProfile.id } },
        },
      });

      imported++;
    }

    return NextResponse.json({ imported });
  } catch (err: any) {
    console.error("[admin/import]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
