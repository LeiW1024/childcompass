// app/dashboard/provider/listings/[id]/page.tsx — provider edits their listing
import { createClient } from "@/lib/supabase/server";
import { profileRepo, listingRepo } from "@/lib/prisma/repositories";
import { prisma } from "@/lib/prisma/client";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import EditListingForm from "./EditListingForm";

export default async function EditListingPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await profileRepo.findBySupabaseId(user.id);
  if (!profile || profile.role !== "PROVIDER") redirect("/dashboard/parent");
  if (!profile.provider) redirect("/dashboard/provider/setup");

  const listing = await listingRepo.findById(params.id);
  if (!listing) notFound();

  // Verify ownership
  if (listing.providerProfileId !== profile.provider.id) redirect("/dashboard/provider");

  const serialised = {
    ...listing,
    price: Number(listing.price),
    latitude: listing.latitude ?? null,
    longitude: listing.longitude ?? null,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold">Edit listing</h1>
            <p className="text-sm text-muted-foreground mt-1">{listing.title}</p>
          </div>
          <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${
            listing.isPublished
              ? "bg-green-100 text-green-700 border border-green-200"
              : "bg-slate-100 text-slate-500 border border-slate-200"
          }`}>
            {listing.isPublished ? "🟢 Published" : "⚫ Draft"}
          </span>
        </div>
        <EditListingForm listing={serialised} />
      </div>
    </div>
  );
}
