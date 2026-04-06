// app/claim/[token]/page.tsx — Provider claim flow
import { prisma } from "@/lib/prisma/client";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ClaimButton from "./ClaimButton";
import Navbar from "@/components/layout/Navbar";

export default async function ClaimPage({ params }: { params: { token: string } }) {
  const provider = await prisma.providerProfile.findUnique({
    where: { claimToken: params.token },
    include: { listings: { take: 3 } },
  });

  if (!provider) notFound();

  if (provider.isClaimed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-24 text-center space-y-4">
          <div className="text-5xl">✅</div>
          <h1 className="text-2xl font-extrabold">Already claimed</h1>
          <p className="text-muted-foreground">This listing has already been claimed by its provider.</p>
          <Link href="/listings" className="inline-block text-primary font-bold hover:underline">
            Browse listings →
          </Link>
        </div>
      </div>
    );
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-3xl border border-border shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">🏫</div>
          <h1 className="text-2xl font-extrabold mb-2">Claim your listing</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            We&apos;ve listed <strong>{provider.businessName}</strong> on ChildCompass based on publicly
            available information. Claim your profile to manage your listing, update details,
            and receive booking requests directly.
          </p>
        </div>

        {/* What we found */}
        <div className="bg-white rounded-3xl border border-border p-7 space-y-4">
          <h2 className="font-extrabold text-lg">What we found about your organisation</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Name",    value: provider.businessName },
              { label: "City",    value: provider.city ?? "—" },
              { label: "Address", value: provider.address ?? "—" },
              { label: "Phone",   value: provider.phone ?? "—" },
              { label: "Website", value: provider.website ?? "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-semibold">{value}</p>
              </div>
            ))}
          </div>
          {provider.listings.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Listings</p>
              <div className="space-y-2">
                {provider.listings.map(l => (
                  <div key={l.id} className="flex items-center justify-between bg-muted/40 rounded-xl px-4 py-2.5">
                    <span className="text-sm font-semibold">{l.title}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.isPublished ? "card-mint border" : "card-sunshine border"}`}>
                      {l.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* What you get */}
        <div className="bg-white rounded-3xl border border-border p-7 space-y-3">
          <h2 className="font-extrabold text-lg">What you get after claiming</h2>
          {[
            { icon: "✏️", text: "Edit all listing details — description, prices, schedule, photos" },
            { icon: "📬", text: "Receive booking requests directly from parents" },
            { icon: "📊", text: "Dashboard with overview of all your bookings" },
            { icon: "✅", text: "Verified provider badge on your profile" },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3">
              <span className="text-xl shrink-0">{icon}</span>
              <p className="text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {user ? (
          <ClaimButton token={params.token} providerName={provider.businessName} />
        ) : (
          <div className="bg-white rounded-3xl border border-border p-7 text-center space-y-4">
            <p className="font-bold">Create a free account to claim this listing</p>
            <p className="text-sm text-muted-foreground">It takes less than 2 minutes</p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/auth/register?role=PROVIDER&next=/claim/${params.token}`}
                className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition">
                Create provider account →
              </Link>
              <Link
                href={`/auth/login?next=/claim/${params.token}`}
                className="border border-border font-bold px-6 py-3 rounded-xl hover:bg-muted transition text-sm">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
