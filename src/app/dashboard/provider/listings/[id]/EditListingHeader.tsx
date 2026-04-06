"use client";
import { useLang, t } from "@/components/ui/LanguageSwitcher";

type ListingHeader = {
  title: string;
  isPublished: boolean;
};

export default function EditListingHeader({ listing }: { listing: ListingHeader }) {
  const { lang } = useLang();
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-extrabold">{t("editListingTitle", lang)}</h1>
        <p className="text-sm text-muted-foreground mt-1">{listing.title}</p>
      </div>
      <span className={`text-xs font-extrabold px-3 py-1.5 rounded-full ${
        listing.isPublished
          ? "bg-green-100 text-green-700 border border-green-200"
          : "bg-slate-100 text-slate-500 border border-slate-200"
      }`}>
        {listing.isPublished ? "🟢 " + t("statusLiveLabel", lang) : "⚫ " + t("statusDraftLabel", lang)}
      </span>
    </div>
  );
}
