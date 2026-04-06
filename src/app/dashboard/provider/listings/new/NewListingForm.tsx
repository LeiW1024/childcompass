"use client";
// NewListingForm — provider creates a new activity listing
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, CATEGORY_ICONS, type ListingCategory } from "@/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];
const PRICE_PER_OPTIONS = [
  { value: "SESSION", label: "per session" },
  { value: "MONTH",   label: "per month" },
  { value: "WEEK",    label: "per week" },
  { value: "YEAR",    label: "per year" },
];

export default function NewListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "DAYCARE" as ListingCategory,
    ageMinMonths: 0,
    ageMaxMonths: 72,
    price: "",
    pricePer: "MONTH",
    city: "",
    address: "",
    scheduleNotes: "",
    spotsTotal: "",
  });

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        ageMinMonths: Number(form.ageMinMonths),
        ageMaxMonths: Number(form.ageMaxMonths),
        spotsTotal: form.spotsTotal ? parseInt(form.spotsTotal) : null,
        isPublished: true,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setLoading(false);
      return;
    }

    router.push("/dashboard/provider");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-extrabold">Basic info</h2>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Title *</label>
          <input
            type="text"
            required
            placeholder="e.g. Saturday Morning Football for Kids"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Description *</label>
          <textarea
            required
            rows={4}
            placeholder="Describe the activity, what children will learn, and what to expect..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => set("category", cat)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  form.category === cat
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <span>{CATEGORY_ICONS[cat]}</span>
                <span>{CATEGORY_LABELS[cat]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Age + Price */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-extrabold">Age range & pricing</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Min age (months) *</label>
            <input
              type="number"
              required
              min={0}
              max={216}
              value={form.ageMinMonths}
              onChange={e => set("ageMinMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">e.g. 24 = 2 years</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Max age (months) *</label>
            <input
              type="number"
              required
              min={0}
              max={216}
              value={form.ageMaxMonths}
              onChange={e => set("ageMaxMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">e.g. 72 = 6 years</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">Price (€) *</label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              placeholder="e.g. 25"
              value={form.price}
              onChange={e => set("price", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Billing period *</label>
            <select
              value={form.pricePer}
              onChange={e => set("pricePer", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              {PRICE_PER_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Total spots available</label>
          <input
            type="number"
            min={1}
            placeholder="Leave empty if unlimited"
            value={form.spotsTotal}
            onChange={e => set("spotsTotal", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Location + Schedule */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-extrabold">Location & schedule</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">City</label>
            <input
              type="text"
              placeholder="e.g. Erfurt"
              value={form.city}
              onChange={e => set("city", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">Address</label>
            <input
              type="text"
              placeholder="Street and number"
              value={form.address}
              onChange={e => set("address", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">Schedule notes</label>
          <input
            type="text"
            placeholder="e.g. Every Saturday 10:00–11:30"
            value={form.scheduleNotes}
            onChange={e => set("scheduleNotes", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/provider")}
          className="flex-1 border-2 border-border font-extrabold py-3 rounded-2xl hover:bg-muted transition text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white font-extrabold py-3 rounded-2xl hover:bg-primary/90 transition disabled:opacity-60 text-sm"
        >
          {loading ? "Publishing…" : "Publish listing"}
        </button>
      </div>
    </form>
  );
}
