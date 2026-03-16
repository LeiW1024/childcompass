// prisma/fix-coords.mjs — Reset and re-geocode admin-seeded listings via Mapbox
// Run: node prisma/fix-coords.mjs
// Requires NEXT_PUBLIC_MAPBOX_TOKEN in .env.local

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function geocodeAddress(address, city, token) {
  const query = [address, city, "Germany"].filter(Boolean).join(", ");
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?limit=1&access_token=${token}`
    );
    const data = await res.json();
    if (data.features?.[0]) {
      const [lng, lat] = data.features[0].geometry.coordinates;
      return { lat, lng };
    }
  } catch { /* skip */ }
  return null;
}

async function main() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    console.error("❌ NEXT_PUBLIC_MAPBOX_TOKEN not set. Add it to .env.local");
    process.exit(1);
  }

  // 1. Remove the Thüringentherme provider and its listings (not in Erfurt)
  const therme = await prisma.providerProfile.findFirst({
    where: { businessName: "Thüringentherme Erfurt" },
  });
  if (therme) {
    await prisma.listing.deleteMany({ where: { providerProfileId: therme.id } });
    await prisma.providerProfile.delete({ where: { id: therme.id } });
    console.log("🗑️  Removed Thüringentherme provider and listings (not in Erfurt)");
  }

  // 2. Clear all coordinates for admin-seeded listings
  const cleared = await prisma.listing.updateMany({
    where: { isAdminSeeded: true },
    data: { latitude: null, longitude: null },
  });
  console.log(`🔄 Cleared coordinates for ${cleared.count} admin-seeded listings\n`);

  // 3. Re-geocode via Mapbox
  const toGeocode = await prisma.listing.findMany({
    where: { latitude: null, OR: [{ address: { not: null } }, { city: { not: null } }] },
  });

  let geocoded = 0;
  for (const listing of toGeocode) {
    const coords = await geocodeAddress(listing.address ?? "", listing.city ?? "", token);
    if (coords) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { latitude: coords.lat, longitude: coords.lng },
      });
      geocoded++;
      console.log(`  📍 ${listing.title.padEnd(50)} → ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`);
    } else {
      console.log(`  ⚠️  Failed: ${listing.title}`);
    }
    await new Promise(r => setTimeout(r, 120));
  }

  console.log(`\n✅ Geocoded ${geocoded}/${toGeocode.length} listings with accurate Mapbox coordinates.`);
}

main()
  .catch(e => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
