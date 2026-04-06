"use client";
// EditListingForm — update or publish/unpublish an existing listing
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLang, t } from "@/components/ui/LanguageSwitcher";
import { CATEGORY_LABELS, CATEGORY_ICONS, type ListingCategory } from "@/types";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as ListingCategory[];

type Listing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  ageMinMonths: number;
  ageMaxMonths: number;
  price: number;
  pricePer: string;
  city: string | null;
  address: string | null;
  scheduleNotes: string | null;
  spotsTotal: number | null;
  isPublished: boolean;
};

export default function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { lang } = useLang();
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description ?? "",
    category: listing.category as ListingCategory,
    ageMinMonths: listing.ageMinMonths,
    ageMaxMonths: listing.ageMaxMonths,
    price: String(listing.price),
    pricePer: listing.pricePer,
    city: listing.city ?? "",
    address: listing.address ?? "",
    scheduleNotes: listing.scheduleNotes ?? "",
    spotsTotal: listing.spotsTotal ? String(listing.spotsTotal) : "",
  });

  function set(field: string, value: string | number) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function patch(body: Record<string, unknown>, opts?: { onSuccess?: string }) {
    const res = await fetch(`/api/providers/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Something went wrong");
    if (opts?.onSuccess) setSuccess(opts.onSuccess);
    return data;
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await patch({
        ...form,
        price: parseFloat(form.price),
        ageMinMonths: Number(form.ageMinMonths),
        ageMaxMonths: Number(form.ageMaxMonths),
        spotsTotal: form.spotsTotal ? parseInt(form.spotsTotal) : null,
      }, { onSuccess: t("changesSaved", lang) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublish() {
    setPublishLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await patch({ isPublished: !listing.isPublished });
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setPublishLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("deleteConfirmation", lang))) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/providers/listings/${listing.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/dashboard/provider");
    } else {
      const data = await res.json();
      setError(data.error ?? "Could not delete listing");
      setDeleteLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">

      {/* Publish toggle banner */}
      <div className={`rounded-2xl border-2 p-4 flex items-center justify-between gap-4 ${
        listing.isPublished ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
      }`}>
        <div>
          <p className="font-extrabold text-sm">
            {listing.isPublished ? t("statusLiveLabel", lang) : t("statusDraftLabel", lang)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {listing.isPublished
              ? t("statusLiveDesc", lang)
              : t("statusDraftDesc", lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleTogglePublish}
          disabled={publishLoading}
          className={`shrink-0 font-extrabold text-sm px-4 py-2 rounded-xl transition disabled:opacity-60 ${
            listing.isPublished
              ? "bg-slate-200 hover:bg-slate-300 text-slate-700"
              : "bg-primary text-white hover:bg-primary/90"
          }`}
        >
          {publishLoading ? "…" : listing.isPublished ? t("unpublishBtn", lang) : t("publishBtn", lang)}
        </button>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="font-extrabold">{t("basicInfo", lang)}</h2>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("titleField", lang)} *</label>
          <input
            type="text"
            required
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
            <input type="number" required min={0} max={216}
              value={form.ageMinMonths}
              onChange={e => set("ageMinMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("maxAgeLabel", lang)} *</label>
            <input type="number" required min={0} max={216}
              value={form.ageMaxMonths}
              onChange={e => set("ageMaxMonths", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("priceLabel", lang)} *</label>
            <input type="number" required min={0} step="0.01"
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
          <input type="number" min={1}
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
            <input type="text"
              value={form.city}
              onChange={e => set("city", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5">{t("addressLabel", lang)}</label>
            <input type="text"
              value={form.address}
              onChange={e => set("address", e.target.value)}
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1.5">{t("scheduleNotesLabel", lang)}</label>
          <input type="text"
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
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          {success}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard/provider")}
          className="border-2 border-border font-extrabold py-3 px-5 rounded-2xl hover:bg-muted transition text-sm"
        >
          {t("cancelBtn", lang)}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-primary text-white font-extrabold py-3 rounded-2xl hover:bg-primary/90 transition disabled:opacity-60 text-sm"
        >
          {loading ? t("savingBtn", lang) : t("saveBtn", lang)}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLoading}
          className="border-2 border-red-200 text-red-600 font-extrabold py-3 px-5 rounded-2xl hover:bg-red-50 transition disabled:opacity-60 text-sm"
        >
          {deleteLoading ? t("deletingBtn", lang) : t("deleteListingBtn", lang)}
        </button>
      </div>
    </form>
  );
}
