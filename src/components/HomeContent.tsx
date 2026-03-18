"use client";
// components/HomeContent.tsx — all translatable homepage sections
import Link from "next/link";
import { useLang, t } from "@/components/ui/LanguageSwitcher";

export default function HomeContent() {
  const { lang } = useLang();

  const ageGroups = [
    { key: "age0", descKey: "ageDesc0", emoji: "👶", months: "6",  color: "hover:border-blue-400" },
    { key: "age1", descKey: "ageDesc1", emoji: "🐣", months: "18", color: "hover:border-orange-400" },
    { key: "age2", descKey: "ageDesc2", emoji: "🎨", months: "36", color: "hover:border-green-400" },
    { key: "age5", descKey: "ageDesc5", emoji: "🎒", months: "66", color: "hover:border-purple-400" },
  ];

  const steps = [
    { n: "01", icon: "🔍", titleKey: "step1Title", descKey: "step1Desc" },
    { n: "02", icon: "📋", titleKey: "step2Title", descKey: "step2Desc" },
    { n: "03", icon: "✉️", titleKey: "step3Title", descKey: "step3Desc" },
  ];

  const trust = [
    { icon: "✅", key: "trustVerified" },
    { icon: "🔒", key: "trustSafe" },
    { icon: "📍", key: "trustLocal" },
    { icon: "💶", key: "trustPrice" },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-grid py-20 md:py-32 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background pointer-events-none" />
        <div className="hidden lg:block absolute top-20 left-16 text-5xl animate-float">🎨</div>
        <div className="hidden lg:block absolute top-36 right-20 text-4xl animate-float delay-200">⚽</div>
        <div className="hidden lg:block absolute bottom-20 left-32 text-4xl animate-float delay-300">🎵</div>
        <div className="hidden lg:block absolute bottom-28 right-32 text-5xl animate-float delay-400">🌿</div>

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white border border-border rounded-full px-4 py-1.5 text-base font-semibold text-muted-foreground mb-8 shadow-sm animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            {t("heroBadge", lang)}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 animate-fade-up delay-100">
            {t("heroTitle1", lang)}<br />
            <span className="text-primary">{t("heroTitle2", lang)}</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed animate-fade-up delay-200">
            {t("heroSub", lang)}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-up delay-300">
            <Link href="/listings"
              className="bg-primary text-white font-bold text-base px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5 shadow-md">
              {t("exploreBtn", lang)}
            </Link>
            <Link href="/auth/register?role=PROVIDER"
              className="bg-white text-foreground font-bold text-base px-8 py-3.5 rounded-xl border border-border hover:border-primary hover:text-primary transition-all">
              {t("listOffer", lang)}
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-up delay-400">
            {trust.map(tr => (
              <div key={tr.key} className="flex items-center gap-1.5 text-base text-muted-foreground">
                <span>{tr.icon}</span>
                <span className="font-medium">{t(tr.key, lang)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by age group ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3">{t("browseByAge", lang)}</h2>
            <p className="text-muted-foreground">{t("browseByAgeSub", lang)}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ageGroups.map((ag) => (
              <Link key={ag.months} href={`/listings?age=${ag.months}`}
                className={`group flex flex-col items-center text-center gap-2 bg-background border-2 border-border ${ag.color} rounded-2xl p-4 transition-all hover:shadow-md hover:-translate-y-0.5`}>
                <span className="text-4xl group-hover:scale-110 transition-transform">{ag.emoji}</span>
                <div>
                  <p className="font-bold text-base leading-snug">{t(ag.key, lang)}</p>
                  <p className="text-base text-muted-foreground mt-0.5 leading-relaxed hidden sm:block">{t(ag.descKey, lang)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3">{t("howItWorks", lang)}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.n} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition-all hover:-translate-y-0.5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{step.icon}</span>
                  <span className="text-xs font-extrabold text-muted-foreground tracking-widest">{step.n}</span>
                </div>
                <h3 className="font-extrabold text-xl mb-2">{t(step.titleKey, lang)}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{t(step.descKey, lang)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4">{t("ctaTitle", lang)}</h2>
          <p className="text-primary-foreground/80 mb-8 text-xl">{t("ctaSub", lang)}</p>
          <Link href="/listings"
            className="inline-block bg-white text-primary font-extrabold px-8 py-4 rounded-xl hover:bg-white/90 transition-all hover:shadow-xl hover:-translate-y-0.5 text-base">
            {t("ctaBtn", lang)}
          </Link>
        </div>
      </section>
    </>
  );
}
