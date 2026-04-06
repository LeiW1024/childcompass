"use client";
// NewListingForm — provider creates a new activity listing
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang, t } from "@/components/ui/LanguageSwitcher";
import { CATEGORY_LABELS, CATEGORY_ICONS, type ListingCategory } from "@/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];

export default function NewListingForm() {
  const router = useRouter();
  const { lang } = useLang();
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
        <h2 className="font-extrabold">{t("basicInfo", lang)}</h2>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("titleField", lang)} *</label>
          <input
            type="text"
            required
            placeholder="z.B. Samstag Morgen Fußball für Kinder"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("descriptionField", lang)} *</label>
          <textarea
            required
            rows={4}
            placeholder="Beschreiben Sie die Aktivität, was die Kinder lernen und was sie erwartet..."
            value={form.description}
            onChange={e => set("description", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("categoryField", lang)} *</label>
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
        <h2 className="font-extrabold">{t("ageRangeAndPricing", lang)}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("minAgeLabel", lang)} *</label>
            <input
              type="number"
              required
              min={0}
              max={216}
              value={form.ageMinMonths}
              onChange={e => set("ageMinMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">z.B. 24 = 2 Jahre</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("maxAgeLabel", lang)} *</label>
            <input
              type="number"
              required
              min={0}
              max={216}
              value={form.ageMaxMonths}
              onChange={e => set("ageMaxMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-1">z.B. 72 = 6 Jahre</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("priceLabel", lang)} *</label>
            <input
              type="number"
              required
              min={0}
              step="0.01"
              placeholder="z.B. 25"
              value={form.price}
              onChange={e => set("price", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("billingPeriodLabel", lang)} *</label>
            <select
              value={form.pricePer}
              onChange={e => set("pricePer", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
            >
              <option value="SESSION">{t("sessionLabel", lang)}</option>
              <option value="MONTH">{t("monthLabel", lang)}</option>
              <option value="WEEK">{t("weekLabel", lang)}</option>
              <option value="YEAR">{t("yearLabel", lang)}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("totalSpotsLabel", lang)}</label>
          <input
            type="number"
            min={1}
            placeholder="Leer lassen, falls unbegrenzt"
            value={form.spotsTotal}
            onChange={e => set("spotsTotal", e.target.value)}
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Location + Schedule */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-extrabold">{t("locationAndSchedule", lang)}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("cityLabel", lang)}</label>
            <input
              type="text"
              placeholder="z.B. Erfurt"
              value={form.city}
              onChange={e => set("city", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("addressLabel", lang)}</label>
            <input
              type="text"
              placeholder="Straße und Hausnummer"
              value={form.address}
              onChange={e => set("address", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("scheduleNotesLabel", lang)}</label>
          <input
            type="text"
            placeholder="z.B. Jeden Samstag 10:00–11:30"
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
          {t("cancelBtn", lang)}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white font-extrabold py-3 rounded-2xl hover:bg-primary/90 transition disabled:opacity-60 text-sm"
        >
          {loading ? t("publishingBtn", lang) : t("publishListingBtn", lang)}
        </button>
      </div>
    </form>
  );
}
