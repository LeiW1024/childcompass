// app/listings/[id]/page.tsx — Listing detail page
import Navbar from "@/components/layout/Navbar";
import { listingRepo } from "@/lib/prisma/repositories";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ListingDetail from "./ListingDetail";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await listingRepo.findById(params.id);
  if (!listing || !listing.isPublished) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const serialised = {
    ...listing,
    price: Number(listing.price),
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ListingDetail listing={serialised} isLoggedIn={!!user} />
    </div>
  );
}
