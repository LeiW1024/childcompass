// app/auth/layout.tsx
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-grid flex flex-col">
      {/* Top bar */}
      <div className="p-5 shrink-0">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="text-xl">🧭</span>
          <span className="font-extrabold text-lg text-foreground group-hover:text-primary transition-colors">
            ChildCompass
          </span>
        </Link>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-border shadow-xl shadow-black/5 p-8 animate-pop">
          {children}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground p-5 shrink-0">
        &copy; {new Date().getFullYear()} ChildCompass
      </p>
    </div>
  );
}
