// app/api/listings/search/route.ts
// Client-side searchable listings endpoint — returns listings with all map fields
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import type { ListingCategory } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category  = (searchParams.get("category") as ListingCategory) || undefined;
    const ageMonths = searchParams.get("age") ? parseInt(searchParams.get("age")!) : undefined;
    const maxPrice  = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const search    = searchParams.get("q") || undefined;

    const listings = await prisma.listing.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
        ...(ageMonths != null ? {
          ageMinMonths: { lte: ageMonths },
          ageMaxMonths: { gte: ageMonths },
        } : {}),
        ...(maxPrice != null ? { price: { lte: maxPrice } } : {}),
        ...(search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
      },
      include: {
        providerProfile: {
          select: {
            businessName: true,
            logoUrl: true,
            city: true,
            description: true,
            phone: true,
            website: true,
            isClaimed: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ data: listings, error: null });
  } catch (err) {
    console.error("[GET /api/listings/search]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
