// app/admin/layout.tsx
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <span>🧭</span>
            <span className="font-extrabold text-sm">ChildCompass</span>
          </Link>
          <div className="mt-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Admin Panel</div>
        </div>
        <nav className="p-3 flex flex-col gap-1 flex-1">
          {[
            { href: "/admin",          icon: "📊", label: "Overview" },
            { href: "/admin/scraper",  icon: "🔍", label: "Scraper" },
            { href: "/admin/import",   icon: "📥", label: "Import" },
            { href: "/admin/listings", icon: "📋", label: "Listings" },
          { href: "/admin/geocode",  icon: "🗺️", label: "Geocode" },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
