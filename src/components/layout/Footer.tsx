"use client";
// components/layout/Footer.tsx
import Link from "next/link";
import { useLang } from "@/components/ui/LanguageSwitcher";

const FOOTER = {
  en: {
    tagline: "Helping Erfurt families find the best activities for their children.",
    sections: [
      {
        title: "Explore",
        links: [
          { label: "All activities",   href: "/listings" },
          { label: "Daycare",          href: "/listings?category=DAYCARE" },
          { label: "Sports",           href: "/listings?category=SPORTS" },
          { label: "Arts & Crafts",    href: "/listings?category=ARTS_CRAFTS" },
          { label: "Music",            href: "/listings?category=MUSIC" },
          { label: "Swimming",         href: "/listings?category=SWIMMING" },
        ],
      },
      {
        title: "For providers",
        links: [
          { label: "List your offer",  href: "/auth/register?role=PROVIDER" },
          { label: "Provider login",   href: "/auth/login" },
          { label: "Claim your listing", href: "#" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About us",         href: "#" },
          { label: "Contact",          href: "#" },
          { label: "Privacy policy",   href: "#" },
          { label: "Terms of service", href: "#" },
          { label: "Imprint",          href: "#" },
        ],
      },
    ],
    ageTitle: "Browse by age",
    ages: [
      { label: "0–1 year",  href: "/listings?age=6" },
      { label: "1–2 years", href: "/listings?age=18" },
      { label: "2–4 years", href: "/listings?age=36" },
      { label: "5–6 years", href: "/listings?age=66" },
    ],
    copyright: `© ${new Date().getFullYear()} ChildCompass. All rights reserved.`,
    madeIn: "Made with ❤️ in Erfurt, Germany",
  },
  de: {
    tagline: "Wir helfen Erfurter Familien, die besten Aktivitäten für ihre Kinder zu finden.",
    sections: [
      {
        title: "Entdecken",
        links: [
          { label: "Alle Aktivitäten",  href: "/listings" },
          { label: "Kinderbetreuung",   href: "/listings?category=DAYCARE" },
          { label: "Sport",             href: "/listings?category=SPORTS" },
          { label: "Kunst & Basteln",   href: "/listings?category=ARTS_CRAFTS" },
          { label: "Musik",             href: "/listings?category=MUSIC" },
          { label: "Schwimmen",         href: "/listings?category=SWIMMING" },
        ],
      },
      {
        title: "Für Anbieter",
        links: [
          { label: "Angebot eintragen",   href: "/auth/register?role=PROVIDER" },
          { label: "Anbieter-Login",      href: "/auth/login" },
          { label: "Eintrag beanspruchen", href: "#" },
        ],
      },
      {
        title: "Unternehmen",
        links: [
          { label: "Über uns",          href: "#" },
          { label: "Kontakt",           href: "#" },
          { label: "Datenschutz",       href: "#" },
          { label: "Nutzungsbedingungen", href: "#" },
          { label: "Impressum",         href: "#" },
        ],
      },
    ],
    ageTitle: "Nach Alter suchen",
    ages: [
      { label: "0–1 Jahr",   href: "/listings?age=6" },
      { label: "1–2 Jahre",  href: "/listings?age=18" },
      { label: "2–4 Jahre",  href: "/listings?age=36" },
      { label: "5–6 Jahre",  href: "/listings?age=66" },
    ],
    copyright: `© ${new Date().getFullYear()} ChildCompass. Alle Rechte vorbehalten.`,
    madeIn: "Mit ❤️ in Erfurt gemacht",
  },
};

export default function Footer() {
  const { lang } = useLang();
  const f = FOOTER[lang];

  return (
    <footer className="bg-foreground text-background">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧭</span>
              <span className="font-extrabold text-xl text-white">ChildCompass</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-xs">{f.tagline}</p>

            {/* Age quick links */}
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">{f.ageTitle}</p>
            <div className="flex flex-wrap gap-2">
              {f.ages.map(age => (
                <Link key={age.label} href={age.href}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                  {age.label}
                </Link>
              ))}
            </div>

            {/* Social / contact */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: "📧", label: "Email", href: "mailto:hello@childcompass.de" },
                { icon: "📍", label: "Erfurt", href: "#" },
              ].map(s => (
                <a key={s.label} href={s.href}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                  <span>{s.icon}</span> {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {f.sections.map(section => (
            <div key={section.title}>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">{section.title}</p>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-sm text-white/60 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">{f.copyright}</p>
          <p className="text-xs text-white/40">{f.madeIn}</p>
        </div>
      </div>
    </footer>
  );
}
