// app/listings/page.tsx
import Navbar from "@/components/layout/Navbar";
import { listingRepo } from "@/lib/prisma/repositories";
import ListingsClient from "./ListingsClient";

export const dynamic = "force-dynamic";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: { age?: string };
}) {
  const listings = await listingRepo.findPublished({ take: 200 });

  const serialised = listings.map(l => ({
    ...l,
    price: Number(l.price),
    latitude:  l.latitude  ?? null,
    longitude: l.longitude ?? null,
  }));

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
  const initialAge = searchParams?.age ? parseInt(searchParams.age) : null;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Navbar />
      <ListingsClient
        initialListings={serialised}
        mapboxToken={mapboxToken}
        initialAge={initialAge}
      />
    </div>
  );
}
