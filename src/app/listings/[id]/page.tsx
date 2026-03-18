// app/listings/[id]/page.tsx — Listing detail page
import Navbar from "@/components/layout/Navbar";
import { listingRepo } from "@/lib/prisma/repositories";
import { CATEGORY_ICONS, CATEGORY_LABELS, PRICE_PER_LABELS, formatAgeRange } from "@/types";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await listingRepo.findById(params.id);
  if (!listing || !listing.isPublished) notFound();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const provider = listing.providerProfile;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/listings" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
          ← Back to listings
        </Link>

        <div className="bg-white rounded-3xl border-2 border-border overflow-hidden shadow-sm">
          {/* Hero image */}
          <div className="h-56 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-7xl">
            {listing.imageUrl
              ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
              : CATEGORY_ICONS[listing.category]}
          </div>

          <div className="p-8">
            {/* Top badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted">
                {CATEGORY_ICONS[listing.category]} {CATEGORY_LABELS[listing.category]}
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full card-sky border">
                👶 {formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths)}
              </span>
              {listing.spotsTotal && (
                <span className="text-xs font-bold px-3 py-1 rounded-full card-mint border">
                  🎫 {listing.spotsTotal} spots total
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl mb-2">{listing.title}</h1>
            <p className="text-muted-foreground text-sm mb-6">by {provider.businessName}</p>

            {/* Key info grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {[
                { icon: "💶", label: "Price", value: `€${Number(listing.price).toFixed(2)} ${PRICE_PER_LABELS[listing.pricePer]}` },
                { icon: "📅", label: "Schedule", value: listing.scheduleNotes || "Contact provider for schedule" },
                { icon: "📍", label: "Location", value: [listing.address, listing.city].filter(Boolean).join(", ") || "Contact provider" },
                { icon: "👶", label: "Age range", value: formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths) },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex gap-3 bg-muted/40 rounded-xl p-4">
                  <span className="text-xl shrink-0">{icon}</span>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                    <p className="font-semibold text-sm">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="font-bold text-lg mb-3">About this activity</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{listing.description}</p>
            </div>

            {/* Provider info */}
            <div className="bg-muted/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                {provider.logoUrl ? <img src={provider.logoUrl} className="w-full h-full rounded-xl object-cover" /> : "🏫"}
              </div>
              <div>
                <p className="font-bold">{provider.businessName}</p>
                {provider.city && <p className="text-sm text-muted-foreground">📍 {provider.city}</p>}
                {provider.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{provider.description}</p>}
              </div>
            </div>

            {/* CTA */}
            {user ? (
              <Link href={`/listings/${listing.id}/book`}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-base py-4 rounded-2xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-md">
                ✉️ Request a spot
              </Link>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">You need an account to request a booking</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/auth/register"
                    className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-all">
                    Create account
                  </Link>
                  <Link href="/auth/login"
                    className="bg-white border-2 border-border font-bold px-6 py-3 rounded-full hover:border-primary transition-all">
                    Sign in
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
