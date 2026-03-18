// app/admin/login/page.tsx — Simple password-protected admin login
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(false);
    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    setLoading(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen bg-background bg-grid flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-border shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔐</div>
          <h1 className="text-2xl font-extrabold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">ChildCompass internal tools</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
              Incorrect password
            </div>
          )}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Admin password</label>
            <input type="password" value={key} onChange={e => setKey(e.target.value)}
              placeholder="••••••••••••"
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition" />
          </div>
          <button type="submit" disabled={loading || !key}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-60">
            {loading ? "Checking…" : "Enter admin panel →"}
          </button>
        </form>
      </div>
    </div>
  );
}
