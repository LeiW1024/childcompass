// lib/geocode.ts — geocode a single listing via Mapbox and persist coordinates
import { prisma } from "@/lib/prisma/client";

export async function geocodeListing(listingId: string): Promise<void> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { address: true, city: true },
  });
  if (!listing) return;

  const query = [listing.address, listing.city, "Germany"].filter(Boolean).join(", ");
  if (!query.trim()) return;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
    );
    const data = await res.json();
    if (data.features?.[0]) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      await prisma.listing.update({
        where: { id: listingId },
        data: { latitude: lat, longitude: lng },
      });
    }
  } catch (err) {
    console.error("[geocodeListing]", listingId, err);
  }
}
