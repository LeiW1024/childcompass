export const dynamic = "force-dynamic";
// app/admin/listings/page.tsx
import { prisma } from "@/lib/prisma/client";
import { CATEGORY_LABELS } from "@/types";
import AdminImportActions from "../import/AdminImportActions";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      providerProfile: { select: { businessName: true, isClaimed: true } },
    },
  });

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">📋 All Listings</h1>
        <p className="text-sm text-muted-foreground">{listings.length} total listings in the database</p>
      </div>
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              {["Title", "Provider", "Category", "Status", "Claimed", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {listings.map((l, i) => (
              <tr key={l.id} className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                <td className="px-4 py-3 font-semibold max-w-[180px] truncate">{l.title}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-[140px] truncate">{l.providerProfile.businessName}</td>
                <td className="px-4 py-3 text-xs">{CATEGORY_LABELS[l.category]}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.isPublished ? "card-mint border" : "card-sunshine border"}`}>
                    {l.isPublished ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.providerProfile.isClaimed ? "card-mint border" : "card-coral border"}`}>
                    {l.providerProfile.isClaimed ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <AdminImportActions listingId={l.id} />
                </td>
              </tr>
            ))}
            {listings.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No listings yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
