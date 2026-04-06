"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLang } from "@/components/ui/LanguageSwitcher";

interface ProviderProfile {
  id: string;
  businessName: string;
  city: string | null;
  phone: string | null;
  description: string | null;
  address: string | null;
  website: string | null;
}

interface Props {
  provider: ProviderProfile;
}

interface FormData {
  description: string;
  website: string;
  address: string;
  city: string;
}

const TOTAL_STEPS = 3;

export default function SetupWizard({ provider }: Props) {
  const { lang } = useLang();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    description: provider.description ?? "",
    website: provider.website ?? "",
    address: provider.address ?? "",
    city: provider.city ?? "",
  });

  const t = (de: string, en: string) => (lang === "de" ? de : en);

  function updateField(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function patchProvider(data: Partial<FormData>) {
    const res = await fetch(`/api/providers/${provider.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      setError(t("Fehler beim Speichern", "Failed to save"));
      return false;
    }
    setError(null);
    return true;
  }

  async function handleStart() {
    setStep(2);
  }

  async function handleStep2Next() {
    if (!form.description.trim()) {
      setError(t("Bitte Beschreibung eingeben", "Please enter a description"));
      return;
    }
    setSaving(true);
    const ok = await patchProvider({ description: form.description, website: form.website || undefined });
    setSaving(false);
    if (ok) setStep(3);
  }

  async function handleStep3Submit() {
    if (!form.address.trim()) {
      setError(t("Bitte Adresse eingeben", "Please enter an address"));
      return;
    }
    setSaving(true);
    const ok = await patchProvider({
      description: form.description,
      website: form.website || undefined,
      address: form.address,
      city: form.city,
    });
    setSaving(false);
    if (ok) {
      router.push("/dashboard/provider");
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Step indicator */}
      <div className="w-full max-w-lg mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-muted-foreground">
            {t(`Schritt ${step} von ${TOTAL_STEPS}`, `Step ${step} of ${TOTAL_STEPS}`)}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">
            {Math.round((step / TOTAL_STEPS) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (
            <div
              key={s}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all",
                s < step
                  ? "bg-primary border-primary text-white"
                  : s === step
                  ? "bg-white border-primary text-primary"
                  : "bg-white border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {s < step ? "✓" : s}
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl border-2 border-border shadow-sm p-8 animate-fade-up">

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="text-2xl font-extrabold tracking-tight mb-2">
              {t("Willkommen!", "Welcome!")}
            </h1>
            <p className="text-lg font-semibold text-foreground mb-1">
              {t("Vervollständige dein Profil", "Complete your profile")}
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
              {t(
                `Hallo ${provider.businessName}! Nur noch ein paar Schritte, um dein Profil zu vervollständigen und Buchungsanfragen zu erhalten.`,
                `Hello ${provider.businessName}! Just a few steps to complete your profile and start receiving booking requests.`
              )}
            </p>
            <button
              onClick={handleStart}
              className="w-full bg-primary text-white font-extrabold py-3 rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-md text-base"
            >
              {t("Start", "Start")}
            </button>
          </div>
        )}

        {/* ── Step 2: About your business ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-1">
              {t("Über dein Angebot", "About your business")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t(
                "Beschreibe dein Angebot für Eltern — was macht dich besonders?",
                "Describe your offer for parents — what makes you special?"
              )}
            </p>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold mb-1.5"
                >
                  {t("Beschreibung", "Description")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={form.description}
                  onChange={e => updateField("description", e.target.value)}
                  placeholder={t(
                    "z.B. Wir bieten altersgerechte Kurse für Kinder von 0–6 Jahren an…",
                    "e.g. We offer age-appropriate courses for children aged 0–6…"
                  )}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-semibold mb-1.5"
                >
                  {t("Website", "Website")}{" "}
                  <span className="text-muted-foreground text-xs font-normal">
                    ({t("optional", "optional")})
                  </span>
                </label>
                <input
                  id="website"
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={e => updateField("website", e.target.value)}
                  placeholder="https://beispiel.de"
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setStep(1); setError(null); }}
                className="flex-1 border-2 border-border text-foreground font-extrabold py-3 rounded-2xl hover:bg-muted/50 transition-all text-sm"
              >
                {t("Zurück", "Back")}
              </button>
              <button
                onClick={handleStep2Next}
                disabled={saving}
                className={cn(
                  "flex-1 bg-primary text-white font-extrabold py-3 rounded-2xl transition-all text-sm",
                  saving ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90 hover:scale-105 shadow-md"
                )}
              >
                {saving ? t("Speichern…", "Saving…") : t("Weiter", "Next")}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Location ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-extrabold tracking-tight mb-1">
              {t("Standort", "Location")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t(
                "Wo können Eltern dich finden?",
                "Where can parents find you?"
              )}
            </p>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold mb-1.5"
                >
                  {t("Adresse", "Address")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={e => updateField("address", e.target.value)}
                  placeholder={t("Musterstraße 1", "123 Example St")}
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold mb-1.5"
                >
                  {t("Stadt", "City")}
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={form.city}
                  onChange={e => updateField("city", e.target.value)}
                  placeholder="Erfurt"
                  className="w-full border-2 border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => { setStep(2); setError(null); }}
                className="flex-1 border-2 border-border text-foreground font-extrabold py-3 rounded-2xl hover:bg-muted/50 transition-all text-sm"
              >
                {t("Zurück", "Back")}
              </button>
              <button
                onClick={handleStep3Submit}
                disabled={saving}
                className={cn(
                  "flex-1 bg-primary text-white font-extrabold py-3 rounded-2xl transition-all text-sm",
                  saving ? "opacity-60 cursor-not-allowed" : "hover:bg-primary/90 hover:scale-105 shadow-md"
                )}
              >
                {saving ? t("Speichern…", "Saving…") : t("Abschließen", "Finish")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        {t(
          "Du kannst diese Angaben jederzeit in deinem Dashboard ändern.",
          "You can update this information anytime from your dashboard."
        )}
      </p>
    </div>
  );
}
