"use client";
// app/admin/scraper/page.tsx — Claude-powered provider scraper UI

import { useState } from "react";
import { CATEGORY_LABELS, type ListingCategory } from "@/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];

const AGE_GROUPS = [
  { label: "0 – 1 year",   value: "0-12 months" },
  { label: "1 – 2 years",  value: "1-2 years" },
  { label: "2 – 4 years",  value: "2-4 years" },
  { label: "5 – 6 years",  value: "5-6 years" },
  { label: "All ages",     value: "0-6 years" },
];

interface ScrapedProvider {
  businessName: string;
  description: string;
  address?: string;
  city: string;
  phone?: string;
  website?: string;
  category: ListingCategory;
  ageMinMonths: number;
  ageMaxMonths: number;
  price: number;
  pricePer: string;
  scheduleNotes?: string;
  sourceUrl?: string;
}

export default function ScraperPage() {
  const [category, setCategory] = useState<ListingCategory>("DAYCARE");
  const [ageGroup, setAgeGroup] = useState("0-6 years");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedProvider[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<number | null>(null);

  async function runScraper() {
    setLoading(true); setError(null); setResults(null);
    setSelected(new Set()); setImportSuccess(null);
    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, ageGroup, city: "Erfurt" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");
      setResults(data.data.providers);
      // Select all by default
      setSelected(new Set(data.data.providers.map((_: any, i: number) => i)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  async function importSelected() {
    if (!results || selected.size === 0) return;
    setImporting(true); setError(null);
    const toImport = results.filter((_, i) => selected.has(i));
    try {
      const res = await fetch("/api/admin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: toImport }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setImportSuccess(data.data.imported);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-extrabold mb-1">🔍 Provider Scraper</h1>
        <p className="text-sm text-muted-foreground">
          Uses Claude AI + web search to find real childcare providers in Erfurt.
          Results are not yet saved — review them first, then import.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as ListingCategory)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white">
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide block mb-2">Age group</label>
            <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition bg-white">
              {AGE_GROUPS.map(ag => (
                <option key={ag.value} value={ag.value}>{ag.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={runScraper} disabled={loading}
            className="flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition disabled:opacity-60">
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching with Claude…
              </>
            ) : (
              <> 🔍 Run scraper</>
            )}
          </button>
          {loading && (
            <p className="text-sm text-muted-foreground animate-pulse">
              Claude is searching the web for real providers in Erfurt… this takes ~20–40 seconds
            </p>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Import success */}
      {importSuccess !== null && (
        <div className="rounded-2xl card-mint border-2 p-4 text-sm font-bold flex items-center gap-2">
          ✅ Successfully imported {importSuccess} providers into the database!
          <a href="/admin/import" className="text-primary underline ml-1">Review in Import →</a>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-lg">Found {results.length} providers</h2>
              <p className="text-sm text-muted-foreground">{selected.size} selected for import</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(new Set(results.map((_, i) => i)))}
                className="text-sm font-semibold text-primary hover:underline">Select all</button>
              <button onClick={() => setSelected(new Set())}
                className="text-sm font-semibold text-muted-foreground hover:underline">Clear</button>
              <button onClick={importSelected} disabled={importing || selected.size === 0}
                className="bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition disabled:opacity-60 text-sm flex items-center gap-2">
                {importing ? (
                  <><span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Importing…</>
                ) : (
                  <>📥 Import {selected.size} selected</>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((provider, i) => (
              <div key={i}
                onClick={() => toggleSelect(i)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all hover:shadow-md ${selected.has(i) ? "border-primary bg-primary/5" : "border-border"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors ${selected.has(i) ? "bg-primary border-primary" : "border-border"}`}>
                    {selected.has(i) && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-extrabold text-base">{provider.businessName}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full card-sky border">
                            {CATEGORY_LABELS[provider.category]}
                          </span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full card-sunshine border">
                            {provider.ageMinMonths/12 < 1 ? `${provider.ageMinMonths}mo` : `${Math.floor(provider.ageMinMonths/12)}y`}
                            {" – "}
                            {Math.floor(provider.ageMaxMonths/12)}y
                          </span>
                          {provider.price > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full card-mint border">
                              €{provider.price}/{provider.pricePer.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                      {provider.website && (
                        <a href={provider.website} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-xs font-semibold text-primary hover:underline shrink-0">
                          🔗 Website
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{provider.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                      {provider.address && <span>📍 {provider.address}</span>}
                      {provider.phone && <span>📞 {provider.phone}</span>}
                      {provider.scheduleNotes && <span>📅 {provider.scheduleNotes}</span>}
                      {provider.sourceUrl && (
                        <a href={provider.sourceUrl} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          className="text-primary hover:underline">
                          Source ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
