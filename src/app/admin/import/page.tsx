export const dynamic = "force-dynamic";
// app/admin/import/page.tsx — Review & publish scraped listings
import { prisma } from "@/lib/prisma/client";
import { CATEGORY_LABELS } from "@/types";
import AdminImportActions from "./AdminImportActions";

export default async function AdminImportPage() {
  const unseeded = await prisma.listing.findMany({
    where: { isAdminSeeded: true, isPublished: false },
    include: { providerProfile: { select: { businessName: true, isClaimed: true, claimToken: true, website: true } } },
    orderBy: { createdAt: "desc" },
  });

  const published = await prisma.listing.findMany({
    where: { isAdminSeeded: true, isPublished: true },
    include: { providerProfile: { select: { businessName: true, isClaimed: true } } },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">📥 Import Review</h1>
        <p className="text-sm text-muted-foreground">
          Review scraped listings before publishing them. Published listings appear on the public site.
        </p>
      </div>

      {/* Pending review */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Pending review <span className="ml-2 text-xs bg-accent text-foreground font-bold px-2 py-0.5 rounded-full">{unseeded.length}</span></h2>
        </div>
        {unseeded.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No listings pending review. <a href="/admin/scraper" className="text-primary font-bold hover:underline">Run the scraper</a> to find providers.
          </div>
        ) : (
          <div className="space-y-3">
            {unseeded.map(listing => (
              <div key={listing.id} className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold">{listing.title}</p>
                    <p className="text-sm text-muted-foreground">{listing.providerProfile.businessName}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full card-sky border">
                        {CATEGORY_LABELS[listing.category]}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full card-sunshine border">
                        {Math.floor(listing.ageMinMonths/12)}y – {Math.floor(listing.ageMaxMonths/12)}y
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-muted border">
                        €{Number(listing.price)}/{listing.pricePer.toLowerCase()}
                      </span>
                      {listing.providerProfile.website && (
                        <a href={listing.providerProfile.website} target="_blank" rel="noopener noreferrer"
                          className="text-xs font-bold px-2 py-0.5 rounded-full card-lavender border text-primary hover:underline">
                          🔗 Website
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{listing.description}</p>
                    {/* Claim link */}
                    <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-semibold">Claim link for provider:</p>
                      <p className="text-xs font-mono text-primary break-all">
                        {process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/claim/{listing.providerProfile.claimToken}
                      </p>
                    </div>
                  </div>
                  <AdminImportActions listingId={listing.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published */}
      {published.length > 0 && (
        <div>
          <h2 className="font-bold text-lg mb-4">Published ({published.length})</h2>
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {["Title", "Category", "Claimed"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {published.map((l, i) => (
                  <tr key={l.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                    <td className="px-4 py-3 font-semibold">{l.title}</td>
                    <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[l.category]}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.providerProfile.isClaimed ? "card-mint border" : "card-sunshine border"}`}>
                        {l.providerProfile.isClaimed ? "✅ Claimed" : "📬 Unclaimed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
