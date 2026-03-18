// app/admin/page.tsx — Admin overview
import { prisma } from "@/lib/prisma/client";
import Link from "next/link";

export default async function AdminOverviewPage() {
  const [totalListings, publishedListings, unclaimedProviders, totalProviders] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { isPublished: true } }),
    prisma.providerProfile.count({ where: { isClaimed: false } }),
    prisma.providerProfile.count(),
  ]);

  const recentListings = await prisma.listing.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { providerProfile: { select: { businessName: true, isClaimed: true } } },
  });

  const stats = [
    { label: "Total listings",      value: totalListings,      icon: "📋", color: "card-sky" },
    { label: "Published",           value: publishedListings,  icon: "✅", color: "card-mint" },
    { label: "Total providers",     value: totalProviders,     icon: "🏫", color: "card-sunshine" },
    { label: "Unclaimed providers", value: unclaimedProviders, icon: "📬", color: "card-coral" },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">ChildCompass platform stats</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`rounded-2xl border-2 p-5 ${s.color}`}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-lg mb-4">Quick actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { href: "/admin/scraper", icon: "🔍", title: "Run scraper", desc: "Find new providers in Erfurt" },
            { href: "/admin/import",  icon: "📥", title: "Review imports", desc: "Check and publish scraped results" },
            { href: "/admin/listings",icon: "📋", title: "Manage listings", desc: "Edit, publish or delete listings" },
          { href: "/admin/geocode",  icon: "🗺️", title: "Geocode listings", desc: "Add map coordinates to all listings" },
          ].map(a => (
            <Link key={a.href} href={a.href}
              className="bg-white rounded-2xl border border-border hover:border-primary hover:shadow-md transition-all p-5 flex items-start gap-4">
              <div className="text-3xl shrink-0">{a.icon}</div>
              <div>
                <p className="font-bold text-sm">{a.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent listings */}
      <div>
        <h2 className="font-bold text-lg mb-4">Recent listings</h2>
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {["Title", "Provider", "Status", "Claimed"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentListings.map((l, i) => (
                <tr key={l.id} className={i % 2 === 0 ? "" : "bg-muted/20"}>
                  <td className="px-4 py-3 font-semibold">{l.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.providerProfile.businessName}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.isPublished ? "card-mint border" : "card-coral border"}`}>
                      {l.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${l.providerProfile.isClaimed ? "card-mint border" : "card-sunshine border"}`}>
                      {l.providerProfile.isClaimed ? "Claimed" : "Unclaimed"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentListings.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">No listings yet — run the scraper first</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
