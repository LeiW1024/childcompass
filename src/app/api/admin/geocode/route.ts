// app/api/admin/geocode/route.ts
// Geocodes listings with addresses using Mapbox — adds lat/lng for map pins
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST() {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return NextResponse.json({ data: null, error: "Mapbox token not configured" }, { status: 500 });

    const listings = await prisma.listing.findMany({
      where: { latitude: null, OR: [{ address: { not: null } }, { city: { not: null } }] },
      take: 50,
    });

    let geocoded = 0;
    for (const listing of listings) {
      const query = [listing.address, listing.city, "Germany"].filter(Boolean).join(", ");
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
        );
        const data = await res.json();
        if (data.features?.[0]) {
          const [lng, lat] = data.features[0].geometry.coordinates;
          await prisma.listing.update({ where: { id: listing.id }, data: { latitude: lat, longitude: lng } });
          geocoded++;
        }
      } catch { /* skip */ }
      await new Promise(r => setTimeout(r, 120));
    }
    return NextResponse.json({ data: { geocoded, total: listings.length }, error: null });
  } catch (err) {
    console.error("[admin/geocode]", err);
    return NextResponse.json({ data: null, error: "Internal server error" }, { status: 500 });
  }
}
