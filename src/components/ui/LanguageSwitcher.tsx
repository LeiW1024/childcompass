"use client";
// Language context + switcher — shared across the whole app via React Context
import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Lang = "en" | "de";

// ─── All translations ─────────────────────────────────────────────────────────
export const LABELS: Record<string, Record<Lang, string>> = {
  // Navbar
  explore:            { en: "Explore",                    de: "Entdecken" },
  forProviders:       { en: "For providers",              de: "Für Anbieter" },
  dashboard:          { en: "Dashboard",                  de: "Übersicht" },
  signIn:             { en: "Sign in",                    de: "Anmelden" },
  signOut:            { en: "Sign out",                   de: "Abmelden" },
  getStarted:         { en: "Get started",                de: "Loslegen" },
  // Homepage hero
  heroBadge:          { en: "Trusted by families across the city", de: "Von Familien in der Stadt vertraut" },
  heroTitle1:         { en: "Find the perfect activities", de: "Die perfekten Aktivitäten" },
  heroTitle2:         { en: "for your little ones",        de: "für Ihre Kleinen finden" },
  heroSub:            { en: "Discover age-appropriate childcare, playgroups, sports and creative activities. Compare, request and book — all in one place.", de: "Entdecken Sie altersgerechte Kinderbetreuung, Spielgruppen, Sport und kreative Aktivitäten. Vergleichen, anfragen und buchen — alles an einem Ort." },
  exploreBtn:         { en: "Explore activities →",       de: "Aktivitäten entdecken →" },
  listOffer:          { en: "List your offer",             de: "Angebot eintragen" },
  // Trust badges
  trustVerified:      { en: "Verified providers",          de: "Geprüfte Anbieter" },
  trustSafe:          { en: "Safe & secure",               de: "Sicher & geschützt" },
  trustLocal:         { en: "Local to you",                de: "In Ihrer Nähe" },
  trustPrice:         { en: "Transparent pricing",         de: "Transparente Preise" },
  // Age groups section
  browseByAge:        { en: "Browse by age group",         de: "Nach Altersgruppe suchen" },
  browseByAgeSub:     { en: "Find activities perfectly matched to your child's development stage", de: "Aktivitäten passend zur Entwicklungsstufe Ihres Kindes" },
  age0:               { en: "0 – 1 year",                  de: "0 – 1 Jahr" },
  age1:               { en: "1 – 2 years",                 de: "1 – 2 Jahre" },
  age2:               { en: "2 – 4 years",                 de: "2 – 4 Jahre" },
  age5:               { en: "5 – 6 years",                 de: "5 – 6 Jahre" },
  ageDesc0:           { en: "Sensory play & early bonding",       de: "Sinnesspiele & erste Bindung" },
  ageDesc1:           { en: "Movement, music & first words",      de: "Bewegung, Musik & erste Worte" },
  ageDesc2:           { en: "Creativity, language & social play", de: "Kreativität, Sprache & soziales Spielen" },
  ageDesc5:           { en: "School prep & team activities",      de: "Schulvorbereitung & Teamaktivitäten" },
  // How it works
  howItWorks:         { en: "How ChildCompass works",      de: "So funktioniert ChildCompass" },
  step1Title:         { en: "Filter by age & category",    de: "Nach Alter & Kategorie filtern" },
  step1Desc:          { en: "Tell us how old your child is. We'll show only what's right for them.", de: "Sagen Sie uns, wie alt Ihr Kind ist. Wir zeigen nur passende Angebote." },
  step2Title:         { en: "Compare listings",            de: "Angebote vergleichen" },
  step2Desc:          { en: "Price, schedule, location and provider details — all on one page.", de: "Preis, Zeitplan, Standort und Anbieterdetails — alles auf einer Seite." },
  step3Title:         { en: "Send a booking request",      de: "Buchungsanfrage senden" },
  step3Desc:          { en: "No phone calls. Just send a request and wait for confirmation.", de: "Keine Anrufe. Einfach Anfrage senden und auf Bestätigung warten." },
  // CTA section
  ctaTitle:           { en: "Ready to explore?",           de: "Bereit zum Entdecken?" },
  ctaSub:             { en: "Join hundreds of Erfurt families already using ChildCompass.", de: "Schließen Sie sich hunderten Erfurter Familien an, die ChildCompass nutzen." },
  ctaBtn:             { en: "Find activities near me →",   de: "Aktivitäten in meiner Nähe →" },
  // Listings page
  searchPlaceholder:  { en: "Search activities…",          de: "Aktivitäten suchen…" },
  allCategories:      { en: "All",                         de: "Alle" },
  allAges:            { en: "All ages",                    de: "Alle Altersgruppen" },
  anyPrice:           { en: "Any price",                   de: "Jeder Preis" },
  activities:         { en: "activities",                  de: "Aktivitäten" },
  activity:           { en: "activity",                    de: "Aktivität" },
  noActivities:       { en: "No activities found",         de: "Keine Aktivitäten gefunden" },
  adjustFilters:      { en: "Try adjusting your filters",  de: "Bitte Filter anpassen" },
  viewDetails:        { en: "View Details →",              de: "Details →" },
  requestBooking:     { en: "Request a booking",           de: "Buchung anfragen" },
  about:              { en: "About this activity",         de: "Über diese Aktivität" },
  price:              { en: "Price",                       de: "Preis" },
  location:           { en: "Location",                    de: "Standort" },
  period:             { en: "Period",                      de: "Zeitraum" },
  times:              { en: "Times",                       de: "Zeiten" },
  verified:           { en: "Verified",                    de: "Verifiziert" },
  maxParticipants:    { en: "Max",                         de: "Max." },
  by:                 { en: "by",                          de: "von" },
  free:               { en: "N/A",                         de: "k.A." },
  freeShort:          { en: "N/A",                         de: "k.A." },
  // Chat widget
  chatTitle:          { en: "Support",                     de: "Hilfe" },
  chatWelcome:        { en: "Hi! How can we help you today?", de: "Hallo! Wie können wir Ihnen helfen?" },
  chatPlaceholder:    { en: "Type your message...",        de: "Nachricht eingeben..." },
  chatSend:           { en: "Send",                        de: "Senden" },
  chatError:          { en: "Failed to send. Please try again.", de: "Senden fehlgeschlagen. Bitte erneut versuchen." },
  // Create listing form
  createNewListing:   { en: "Create new listing",          de: "Neues Angebot erstellen" },
  createListingSub:   { en: "Fill in the details and publish immediately. You can edit it anytime.", de: "Füllen Sie die Details aus und veröffentlichen Sie sofort. Sie können es jederzeit bearbeiten." },
  basicInfo:          { en: "Basic info",                  de: "Grundinformationen" },
  titleField:         { en: "Title",                       de: "Titel" },
  descriptionField:   { en: "Description",                 de: "Beschreibung" },
  categoryField:      { en: "Category",                    de: "Kategorie" },
  ageRangeAndPricing: { en: "Age range & pricing",         de: "Altersbereich & Preisgestaltung" },
  minAgeLabel:        { en: "Min age (months)",            de: "Mindestalter (Monate)" },
  maxAgeLabel:        { en: "Max age (months)",            de: "Maximales Alter (Monate)" },
  priceLabel:         { en: "Price (€)",                   de: "Preis (€)" },
  billingPeriodLabel: { en: "Billing period",              de: "Abrechnungszeitraum" },
  totalSpotsLabel:    { en: "Total spots available",       de: "Verfügbare Plätze insgesamt" },
  locationAndSchedule:{ en: "Location & schedule",         de: "Standort & Zeitplan" },
  cityLabel:          { en: "City",                        de: "Stadt" },
  addressLabel:       { en: "Address",                     de: "Adresse" },
  scheduleNotesLabel: { en: "Schedule notes",              de: "Zeitplan-Notizen" },
  cancelBtn:          { en: "Cancel",                      de: "Abbrechen" },
  publishListingBtn:  { en: "Publish listing",             de: "Angebot veröffentlichen" },
  publishingBtn:      { en: "Publishing…",                 de: "Veröffentlichung läuft…" },
  sessionLabel:       { en: "per session",                 de: "pro Sitzung" },
  monthLabel:         { en: "per month",                   de: "pro Monat" },
  weekLabel:          { en: "per week",                    de: "pro Woche" },
  yearLabel:          { en: "per year",                    de: "pro Jahr" },
};

export type LabelKey = keyof typeof LABELS;

export function t(key: LabelKey, lang: Lang): string {
  return LABELS[key]?.[lang] ?? LABELS[key]?.en ?? key;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: "en", setLang: () => {},
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  useEffect(() => {
    const stored = localStorage.getItem("cc_lang") as Lang | null;
    setLangState(stored === "en" ? "en" : "de"); // default DE
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("cc_lang", l);
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// ─── Switcher button ──────────────────────────────────────────────────────────
export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center bg-muted rounded-xl p-0.5 border border-border">
      {(["en", "de"] as Lang[]).map(l => (
        <button key={l} onClick={() => setLang(l)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
            lang === l ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}>
          <span>{l === "en" ? "🇬🇧" : "🇩🇪"}</span>
          <span>{l === "en" ? "EN" : "DE"}</span>
        </button>
      ))}
    </div>
  );
}
