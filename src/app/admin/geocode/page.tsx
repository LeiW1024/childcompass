"use client";
// app/admin/geocode/page.tsx — One-click geocoding for all listings
import { useState } from "react";

export default function GeocodePage() {
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState<{ geocoded: number; total: number } | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  async function run() {
    setLoading(true); setError(null); setResult(null);
    const res = await fetch("/api/admin/geocode", { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error); return; }
    setResult(data.data);
  }

  return (
    <div className="p-8 max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">🗺️ Geocode Listings</h1>
        <p className="text-sm text-muted-foreground">
          Adds latitude/longitude coordinates to listings that have addresses.
          This makes them appear as pins on the map. Run this after every import.
        </p>
      </div>
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <p className="text-sm text-muted-foreground">
          Uses Mapbox Geocoding API to convert addresses → coordinates.
          Processes up to 50 listings per run. Run multiple times if you have more.
        </p>
        <button onClick={run} disabled={loading}
          className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-60">
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Geocoding…</>
            : "🗺️ Run geocoding"}
        </button>
        {error && <p className="text-sm text-destructive font-medium">⚠️ {error}</p>}
        {result && (
          <div className="rounded-xl card-mint border-2 p-4">
            <p className="font-bold">✅ Done!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Geocoded <strong>{result.geocoded}</strong> of <strong>{result.total}</strong> listings.
              {result.total > result.geocoded && " Some addresses could not be resolved."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
