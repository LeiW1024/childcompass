// app/dashboard/provider/page.tsx
import { createClient } from "@/lib/supabase/server";
import { profileRepo, bookingRepo, listingRepo } from "@/lib/prisma/repositories";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS } from "@/types";
import Navbar from "@/components/layout/Navbar";

const PRICE_PER: Record<string, string> = { SESSION:"/ session", MONTH:"/ month", WEEK:"/ week", YEAR:"/ year" };

export default async function ProviderDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const profile = await profileRepo.findBySupabaseId(user.id);
  if (!profile) redirect("/auth/login");
  if (profile.role !== "PROVIDER") redirect("/dashboard/parent");

  const providerProfile = profile.provider;
  if (!providerProfile) redirect("/dashboard/provider/setup");

  const [bookings, listings] = await Promise.all([
    bookingRepo.findByProviderListings(providerProfile.id),
    listingRepo.findByProvider(providerProfile.id),
  ]);

  const pending   = bookings.filter(b => b.status === "REQUESTED");
  const confirmed = bookings.filter(b => b.status === "CONFIRMED");
  const published = listings.filter(l => l.isPublished);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Hero header ── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:"linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%), linear-gradient(45deg, white 25%, transparent 25%, transparent 75%, white 75%)", backgroundSize:"8px 8px", backgroundPosition:"0 0, 4px 4px"}} />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative z-10 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full">
                  {providerProfile.isClaimed ? "✓ Verified Provider" : "🔓 Unclaimed listing"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{providerProfile.businessName}</h1>
              <p className="text-slate-400 mt-1 text-sm">📍 {providerProfile.city ?? "Erfurt"}</p>
            </div>
            <Link href="/dashboard/provider/listings/new"
              className="shrink-0 bg-primary text-white font-extrabold text-sm px-5 py-2.5 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg">
              + New listing
            </Link>
          </div>

          {/* Stats row */}
          <div className="relative z-10 mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: listings.length,   label: "Total listings",  emoji: "📋" },
              { n: published.length,  label: "Published",       emoji: "🟢" },
              { n: pending.length,    label: "Pending requests",emoji: "⏳" },
              { n: confirmed.length,  label: "Confirmed",       emoji: "✅" },
            ].map(s => (
              <div key={s.label} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center hover:bg-white/15 transition-colors">
                <p className="text-2xl font-extrabold">{s.n}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{s.emoji} {s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pending requests — most important for provider ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-lg flex items-center gap-2">
              🔔 Booking requests
              {pending.length > 0 && (
                <span className="text-xs bg-amber-400 text-amber-900 font-extrabold px-2.5 py-1 rounded-full animate-pulse">
                  {pending.length} new
                </span>
              )}
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-border p-10 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="font-extrabold mb-1">No requests yet</p>
              <p className="text-sm text-muted-foreground">Once you publish listings, booking requests will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 8).map(b => {
                const isPending = b.status === "REQUESTED";
                return (
                  <div key={b.id}
                    className={`bg-white rounded-2xl border-2 transition-all hover:shadow-md p-4 flex items-center gap-4 ${
                      isPending ? "border-amber-200 hover:border-amber-400" : "border-border hover:border-primary/40"
                    }`}>
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-extrabold shrink-0 ${
                      isPending ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
                    }`}>
                      {(b.parent.fullName ?? b.parent.email ?? "?")[0].toUpperCase()}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-extrabold text-sm">{b.parent.fullName ?? b.parent.email}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isPending
                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                            : b.status === "CONFIRMED"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red-100 text-red-600 border border-red-200"
                        }`}>
                          {isPending ? "⏳ Pending" : b.status === "CONFIRMED" ? "✅ Confirmed" : "❌ Declined"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {CATEGORY_ICONS[(b.listing as any).category as keyof typeof CATEGORY_ICONS]} {(b.listing as any).title}
                        <span className="mx-1">·</span>
                        👦 {b.child.firstName}
                        <span className="mx-1">·</span>
                        {new Date(b.createdAt).toLocaleDateString("de-DE")}
                      </p>
                      {b.message && (
                        <p className="text-xs text-muted-foreground mt-1 italic bg-muted/40 rounded-lg px-2 py-1">
                          "{b.message}"
                        </p>
                      )}
                    </div>
                    {/* Action buttons for pending */}
                    {isPending && (
                      <div className="flex gap-2 shrink-0">
                        <BookingActionButton bookingId={b.id} action="CONFIRMED" label="Accept" />
                        <BookingActionButton bookingId={b.id} action="DECLINED" label="Decline" variant="danger" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Listings ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-lg">📋 Your listings</h2>
            <Link href="/dashboard/provider/listings/new"
              className="text-xs font-extrabold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-xl transition-colors">
              + Add listing
            </Link>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-border p-12 text-center">
              <p className="text-5xl mb-4">🎨</p>
              <p className="font-extrabold text-xl mb-2">No listings yet</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Create your first activity listing to start receiving booking requests from parents.</p>
              <Link href="/dashboard/provider/listings/new"
                className="inline-block bg-primary text-white font-extrabold px-7 py-3 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105">
                Create first listing
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {listings.map(listing => {
                const bookingCount = listing._count?.bookings ?? 0;
                return (
                  <div key={listing.id}
                    className="bg-white rounded-2xl border-2 border-border hover:border-primary/50 hover:shadow-md transition-all group overflow-hidden">
                    {/* Card top */}
                    <div className="p-4 flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                        {CATEGORY_ICONS[listing.category as keyof typeof CATEGORY_ICONS]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-extrabold text-sm leading-snug line-clamp-2">{listing.title}</p>
                          <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                            listing.isPublished ? "bg-green-100 text-green-700 border border-green-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {listing.isPublished ? "🟢 Live" : "⚫ Draft"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {CATEGORY_LABELS[listing.category as keyof typeof CATEGORY_LABELS]}
                          {listing.price && <span className="ml-2">· €{Number(listing.price).toFixed(0)} {PRICE_PER[listing.pricePer] ?? ""}</span>}
                        </p>
                      </div>
                    </div>
                    {/* Card bottom */}
                    <div className="px-4 pb-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>📩 {bookingCount} {bookingCount === 1 ? "request" : "requests"}</span>
                        {listing.city && <span>📍 {listing.city}</span>}
                      </div>
                      <Link href={`/listings/${listing.id}`}
                        className="text-xs font-extrabold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors">
                        View →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// Client component for accept/decline booking actions
import BookingActionButton from "./BookingActionButton";
