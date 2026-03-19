"use client";
// Client component for listing detail — uses language context

import { useLang, t } from "@/components/ui/LanguageSwitcher";
import { CATEGORY_ICONS, CATEGORY_LABELS, PRICE_PER_LABELS, categoryLabel, formatAgeRange, type ListingCategory } from "@/types";
import Link from "next/link";

interface Provider {
  businessName: string; logoUrl: string | null; city: string | null;
  description: string | null;
}

interface Listing {
  id: string; title: string; description: string; descriptionDe: string | null;
  category: ListingCategory; ageMinMonths: number; ageMaxMonths: number;
  price: number; pricePer: string; address: string | null; city: string | null;
  scheduleNotes: string | null; spotsTotal: number | null;
  imageUrl: string | null; providerProfile: Provider;
}

const DAY_MAP: Record<string, string> = {
  monday:"Montag", mondays:"Montags", tuesday:"Dienstag", tuesdays:"Dienstags",
  wednesday:"Mittwoch", wednesdays:"Mittwochs", thursday:"Donnerstag", thursdays:"Donnerstags",
  friday:"Freitag", fridays:"Freitags", saturday:"Samstag", saturdays:"Samstags",
  sunday:"Sonntag", sundays:"Sonntags",
};
const DAY_RE = /\b(mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?)\b/gi;
function locSchedule(text: string, lang: "en" | "de"): string {
  if (lang !== "de") return text;
  return text.replace(DAY_RE, m => DAY_MAP[m.toLowerCase()] ?? m);
}

export default function ListingDetail({ listing, isLoggedIn }: { listing: Listing; isLoggedIn: boolean }) {
  const { lang } = useLang();
  const provider = listing.providerProfile;
  const isFree = Number(listing.price) === 0;

  const priceDisplay = isFree
    ? t("free", lang)
    : `€${Number(listing.price).toFixed(2)} ${PRICE_PER_LABELS[listing.pricePer as keyof typeof PRICE_PER_LABELS]}`;

  const description = lang === "de" ? listing.descriptionDe ?? listing.description : listing.description;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Link href="/listings" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors mb-6 inline-flex items-center gap-1">
        ← {lang === "de" ? "Zurück zu Aktivitäten" : "Back to listings"}
      </Link>

      <div className="bg-white rounded-3xl border-2 border-border overflow-hidden shadow-sm">
        {/* Hero image */}
        <div className="h-56 bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-7xl">
          {listing.imageUrl
            ? <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
            : CATEGORY_ICONS[listing.category]}
        </div>

        <div className="p-8">
          {/* Top badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted">
              {CATEGORY_ICONS[listing.category]} {categoryLabel(listing.category, lang)}
            </span>
            <span className="text-xs font-bold px-3 py-1 rounded-full card-sky border">
              👶 {formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths)}
            </span>
            {listing.spotsTotal && (
              <span className="text-xs font-bold px-3 py-1 rounded-full card-mint border">
                🎫 {listing.spotsTotal} {lang === "de" ? "Plätze" : "spots total"}
              </span>
            )}
          </div>

          <h1 className="font-display text-3xl mb-2">{listing.title}</h1>
          <p className="text-muted-foreground text-sm mb-6">{lang === "de" ? "von" : "by"} {provider.businessName}</p>

          {/* Key info grid */}
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {[
              { icon: "💶", label: lang === "de" ? "Preis" : "Price", value: priceDisplay },
              { icon: "📅", label: lang === "de" ? "Zeitplan" : "Schedule", value: listing.scheduleNotes ? locSchedule(listing.scheduleNotes, lang) : (lang === "de" ? "Anbieter kontaktieren" : "Contact provider for schedule") },
              { icon: "📍", label: lang === "de" ? "Ort" : "Location", value: [listing.address, listing.city].filter(Boolean).join(", ") || (lang === "de" ? "Anbieter kontaktieren" : "Contact provider") },
              { icon: "👶", label: lang === "de" ? "Alter" : "Age range", value: formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths) },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex gap-3 bg-muted/40 rounded-xl p-4">
                <span className="text-xl shrink-0">{icon}</span>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-0.5">{label}</p>
                  <p className="font-semibold text-sm">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-3">
              {lang === "de" ? "Über diese Aktivität" : "About this activity"}
            </h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          {/* Provider info */}
          <div className="bg-muted/30 rounded-2xl p-5 mb-8 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {provider.logoUrl ? <img src={provider.logoUrl} className="w-full h-full rounded-xl object-cover" /> : "🏫"}
            </div>
            <div>
              <p className="font-bold">{provider.businessName}</p>
              {provider.city && <p className="text-sm text-muted-foreground">📍 {provider.city}</p>}
              {provider.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{provider.description}</p>}
            </div>
          </div>

          {/* CTA */}
          {isLoggedIn ? (
            <Link href={`/listings/${listing.id}/book`}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold text-base py-4 rounded-2xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-md">
              ✉️ {lang === "de" ? "Platz anfragen" : "Request a spot"}
            </Link>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                {lang === "de" ? "Du brauchst ein Konto, um eine Buchung anzufragen" : "You need an account to request a booking"}
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/auth/register"
                  className="bg-primary text-white font-bold px-6 py-3 rounded-full hover:bg-primary/90 transition-all">
                  {lang === "de" ? "Konto erstellen" : "Create account"}
                </Link>
                <Link href="/auth/login"
                  className="bg-white border-2 border-border font-bold px-6 py-3 rounded-full hover:border-primary transition-all">
                  {lang === "de" ? "Anmelden" : "Sign in"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
