// lib/geocode.ts — geocode a single listing via Mapbox and persist coordinates
import { prisma } from "@/lib/prisma/client";

export async function geocodeListing(listingId: string): Promise<void> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.warn("[geocodeListing] No Mapbox token available");
    return;
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { address: true, city: true },
  });
  if (!listing) {
    console.warn("[geocodeListing] Listing not found:", listingId);
    return;
  }

  const query = [listing.address, listing.city, "Germany"].filter(Boolean).join(", ");
  if (!query.trim()) {
    console.warn("[geocodeListing] Empty query for listing:", listingId);
    return;
  }

  try {
    console.log("[geocodeListing] Geocoding:", listingId, "query:", query);
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
    );
    const data = await res.json();
    console.log("[geocodeListing] Mapbox response:", { query, status: res.status, features: data.features?.length });

    if (data.features?.[0]) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      console.log("[geocodeListing] Updating coordinates:", { listingId, lat, lng });
      await prisma.listing.update({
        where: { id: listingId },
        data: { latitude: lat, longitude: lng, updatedAt: new Date() },
      });
      console.log("[geocodeListing] Coordinates saved successfully");
    } else {
      console.warn("[geocodeListing] No features found in response:", { query, data });
    }
  } catch (err) {
    console.error("[geocodeListing] Error:", listingId, err);
  }
}
