"use client";
// components/forms/RegisterForm.tsx — Multi-step registration, fully translated
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/ui/LanguageSwitcher";

type Role = "PARENT" | "PROVIDER";
type Gender = "MALE" | "FEMALE" | "OTHER";
interface ChildData { firstName: string; lastName: string; gender: Gender | ""; dateOfBirth: string; }

// ── Step bar ─────────────────────────────────────────────────────────────────
function StepBar({ current, total, role, de }: { current: number; total: number; role: Role; de: boolean }) {
  const labels = de
    ? (role === "PARENT" ? ["Rolle","Daten","Kinder","Datenschutz","Bestätigen"] : ["Rolle","Daten","Einrichtung","Datenschutz","Bestätigen"])
    : (role === "PARENT" ? ["Role","Your info","Children","Privacy","Verify"] : ["Role","Your info","Company","Privacy","Verify"]);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        {labels.map((label, i) => {
          const step = i + 1; const done = step < current; const active = step === current;
          return (
            <div key={label} className="flex flex-col items-center gap-1 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${done ? "bg-green-500 text-white" : active ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                {done ? "✓" : step}
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block ${active ? "text-primary" : "text-muted-foreground"}`}>{label}</span>
            </div>
          );
        })}
      </div>
      <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / (total - 1)) * 100}%` }} />
      </div>
    </div>
  );
}

// ── Child row ─────────────────────────────────────────────────────────────────
function ChildRow({ child, index, onChange, onRemove, canRemove, de }: {
  child: ChildData; index: number; de: boolean;
  onChange: (i: number, field: keyof ChildData, val: string) => void;
  onRemove: (i: number) => void; canRemove: boolean;
}) {
  const inp = "w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition";
  return (
    <div className="bg-muted/40 rounded-2xl p-4 space-y-3 border border-border">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-muted-foreground">{de ? `Kind ${index + 1}` : `Child ${index + 1}`}</p>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)} className="text-xs text-destructive hover:underline font-semibold">
            {de ? "Entfernen" : "Remove"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{de ? "Vorname *" : "First name *"}</label>
          <input value={child.firstName} onChange={e => onChange(index, "firstName", e.target.value)}
            placeholder={de ? "Emma" : "Emma"} required className={inp} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{de ? "Nachname" : "Last name"}</label>
          <input value={child.lastName} onChange={e => onChange(index, "lastName", e.target.value)}
            placeholder={de ? "Müller" : "Smith"} className={inp} />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{de ? "Geschlecht *" : "Gender *"}</label>
          <select value={child.gender} onChange={e => onChange(index, "gender", e.target.value)} required className={inp}>
            <option value="">{de ? "Auswählen…" : "Select…"}</option>
            <option value="FEMALE">{de ? "Mädchen" : "Girl"}</option>
            <option value="MALE">{de ? "Junge" : "Boy"}</option>
            <option value="OTHER">{de ? "Divers" : "Other"}</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">{de ? "Geburtstag *" : "Date of birth *"}</label>
          <input type="date" value={child.dateOfBirth} onChange={e => onChange(index, "dateOfBirth", e.target.value)}
            max={new Date().toISOString().split("T")[0]} required className={inp} />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function RegisterForm({ defaultRole = "PARENT" }: { defaultRole?: string }) {
  const supabase = createClient();
  const { lang } = useLang();
  const de = lang === "de";

  const TOTAL = 5;
  const [step, setStep]   = useState(1);
  const [role, setRole]   = useState<Role>(defaultRole as Role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fullName,  setFullName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [password,  setPassword]  = useState("");
  const [showPass,  setShowPass]  = useState(false);

  const [children, setChildren] = useState<ChildData[]>([{ firstName: "", lastName: "", gender: "", dateOfBirth: "" }]);
  const [companyName, setCompanyName] = useState("");
  const [companyCity, setCompanyCity] = useState("");
  const [companyPhone,setCompanyPhone]= useState("");
  const [privacyOk, setPrivacyOk] = useState(false);

  function next() { setError(null); setStep(s => s + 1); }
  function prev() { setError(null); setStep(s => s - 1); }
  function updateChild(i: number, f: keyof ChildData, v: string) {
    setChildren(prev => prev.map((c, idx) => idx === i ? { ...c, [f]: v } : c));
  }

  function validateStep2() {
    if (!fullName.trim()) { setError(de ? "Bitte vollständigen Namen eingeben." : "Please enter your full name."); return false; }
    if (!email.trim())    { setError(de ? "Bitte E-Mail-Adresse eingeben." : "Please enter your email."); return false; }
    if (password.length < 8) { setError(de ? "Passwort muss mindestens 8 Zeichen haben." : "Password must be at least 8 characters."); return false; }
    return true;
  }
  function validateChildren() {
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      if (!c.firstName.trim()) { setError(de ? `Kind ${i+1}: Vorname erforderlich.` : `Child ${i+1}: first name required.`); return false; }
      if (!c.gender)           { setError(de ? `Kind ${i+1}: Geschlecht auswählen.` : `Child ${i+1}: select gender.`); return false; }
      if (!c.dateOfBirth)      { setError(de ? `Kind ${i+1}: Geburtstag erforderlich.` : `Child ${i+1}: date of birth required.`); return false; }
    }
    return true;
  }
  function validateCompany() {
    if (!companyName.trim()) { setError(de ? "Bitte Einrichtungsname eingeben." : "Please enter company name."); return false; }
    return true;
  }

  async function handleSubmit() {
    setLoading(true); setError(null);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: {
          full_name: fullName, role,
          ...(role === "PARENT" ? { children } : { company_name: companyName, city: companyCity, phone: companyPhone }),
        },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);
    if (error) { setError(de ? "Registrierung fehlgeschlagen. Bitte erneut versuchen." : "Registration failed. Please try again."); return; }
    next();
  }

  async function handleResend() {
    setLoading(true);
    await supabase.auth.resend({ type: "signup", email });
    setLoading(false);
  }

  const inp = "w-full rounded-xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition disabled:opacity-50";
  const btnBack = "flex-1 bg-muted text-foreground font-bold py-3 rounded-xl hover:bg-muted/80 transition text-base";
  const btnNext = "flex-2 flex-grow bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition text-base";

  return (
    <div>
      <StepBar current={step} total={TOTAL} role={role} de={de} />

      {error && (
        <div className="mb-5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {/* STEP 1 — Role */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-extrabold mb-1">{de ? "Wer bist du?" : "Who are you?"}</h2>
            <p className="text-base text-muted-foreground">{de ? "Wähle deine Rolle für die beste Erfahrung." : "Choose your role to personalise your experience."}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {(["PARENT", "PROVIDER"] as Role[]).map(r => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md
                  ${role === r ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-white hover:border-muted-foreground/40"}`}>
                <div className="text-3xl mb-3">{r === "PARENT" ? "👨‍👩‍👧" : "🏫"}</div>
                <div className="font-bold text-base mb-0.5">
                  {de ? (r === "PARENT" ? "Ich bin Elternteil" : "Ich bin Anbieter") : (r === "PARENT" ? "I'm a parent" : "I'm a provider")}
                </div>
                <div className="text-sm text-muted-foreground leading-snug">
                  {de
                    ? (r === "PARENT" ? "Aktivitäten finden & buchen" : "Angebote veröffentlichen & verwalten")
                    : (r === "PARENT" ? "Find & book activities for my child" : "Publish & manage activity listings")}
                </div>
              </button>
            ))}
          </div>
          <button onClick={next} className={btnNext}>{de ? "Weiter →" : "Continue →"}</button>
        </div>
      )}

      {/* STEP 2 — Account details */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold mb-1">{de ? "Deine Kontodaten" : "Your account details"}</h2>
            <p className="text-base text-muted-foreground">{de ? "Damit richten wir dein Konto ein." : "We'll use this to set up your account."}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "Vollständiger Name *" : "Full name *"}</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder={de ? "Maria Müller" : "Jane Smith"} className={inp} />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "E-Mail-Adresse *" : "Email address *"}</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={de ? "name@beispiel.de" : "jane@example.com"} className={inp} />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "Passwort *" : "Password *"}</label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={de ? "Mind. 8 Zeichen" : "Min. 8 characters"} className={inp} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground hover:text-foreground font-semibold">
                {showPass ? (de ? "Verbergen" : "Hide") : (de ? "Zeigen" : "Show")}
              </button>
            </div>
            <div className="mt-1.5 flex gap-1">
              {[4, 6, 8].map(n => (
                <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${
                  password.length >= n ? password.length < 6 ? "bg-destructive" : password.length < 8 ? "bg-accent" : "bg-green-500" : "bg-muted"}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={prev} className={btnBack}>{de ? "← Zurück" : "← Back"}</button>
            <button onClick={() => { if (validateStep2()) next(); }} className={btnNext}>{de ? "Weiter →" : "Continue →"}</button>
          </div>
        </div>
      )}

      {/* STEP 3a — Children */}
      {step === 3 && role === "PARENT" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold mb-1">
              {de ? `Erzähl uns von ${children.length > 1 ? "deinen Kindern" : "deinem Kind"}` : `Tell us about your ${children.length > 1 ? "children" : "child"}`}
            </h2>
            <p className="text-base text-muted-foreground">{de ? "Damit zeigen wir die passendsten Aktivitäten." : "We use this to show the most relevant activities."}</p>
          </div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {children.map((c, i) => (
              <ChildRow key={i} child={c} index={i} onChange={updateChild} onRemove={i => setChildren(prev => prev.filter((_, idx) => idx !== i))} canRemove={children.length > 1} de={de} />
            ))}
          </div>
          {children.length < 5 && (
            <button type="button" onClick={() => setChildren(prev => [...prev, { firstName: "", lastName: "", gender: "", dateOfBirth: "" }])}
              className="w-full border-2 border-dashed border-border rounded-xl py-3 text-base font-bold text-muted-foreground hover:border-primary hover:text-primary transition">
              {de ? "+ Weiteres Kind hinzufügen" : "+ Add another child"}
            </button>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={prev} className={btnBack}>{de ? "← Zurück" : "← Back"}</button>
            <button onClick={() => { if (validateChildren()) next(); }} className={btnNext}>{de ? "Weiter →" : "Continue →"}</button>
          </div>
        </div>
      )}

      {/* STEP 3b — Company */}
      {step === 3 && role === "PROVIDER" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-extrabold mb-1">{de ? "Deine Einrichtung" : "Your organisation"}</h2>
            <p className="text-base text-muted-foreground">{de ? "Hilf Eltern, dich zu finden und dir zu vertrauen." : "Help parents find and trust your listings."}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "Einrichtungsname *" : "Company / organisation name *"}</label>
            <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder={de ? "Sonnenblume Kita GmbH" : "Sunshine Daycare GmbH"} className={inp} />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "Stadt" : "City"}</label>
            <input value={companyCity} onChange={e => setCompanyCity(e.target.value)} placeholder={de ? "Erfurt" : "Berlin"} className={inp} />
          </div>
          <div>
            <label className="text-sm font-semibold text-muted-foreground block mb-2">{de ? "Telefonnummer" : "Phone number"}</label>
            <input type="tel" value={companyPhone} onChange={e => setCompanyPhone(e.target.value)} placeholder="+49 30 123456" className={inp} />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={prev} className={btnBack}>{de ? "← Zurück" : "← Back"}</button>
            <button onClick={() => { if (validateCompany()) next(); }} className={btnNext}>{de ? "Weiter →" : "Continue →"}</button>
          </div>
        </div>
      )}

      {/* STEP 4 — Datenschutz */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-extrabold mb-1">{de ? "Datenschutz" : "Data protection"}</h2>
            <p className="text-base text-muted-foreground">{de ? "Bitte lesen und bestätigen." : "Please read and confirm before continuing."}</p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-5 space-y-3 text-sm text-muted-foreground leading-relaxed border border-border max-h-52 overflow-y-auto">
            <p className="font-bold text-foreground">{de ? "Datenschutzrichtlinie – Zusammenfassung" : "Privacy Policy Summary"}</p>
            <p>{de
              ? "ChildCompass erfasst die von dir angegebenen Daten (Name, E-Mail, Kinderdaten), um die Plattform zu betreiben und passende Aktivitäten zu vermitteln."
              : "ChildCompass collects the personal data you provide (name, email, children's information) to operate the platform and match you with relevant activities."}</p>
            <p>{de
              ? "Deine Daten werden nicht an Dritte verkauft. Sie werden sicher auf EU-Infrastruktur (Supabase) gespeichert."
              : "We do not sell your data to third parties. Your data is stored securely on Supabase EU infrastructure."}</p>
            <p>{de
              ? "Kinderdaten werden ausschließlich zur Altersfilterung genutzt und nur bei einer ausdrücklichen Buchungsanfrage weitergegeben."
              : "Children's data is used only to filter age-appropriate listings and never shared without your explicit booking request."}</p>
            <p>{de
              ? "Du kannst die Löschung deines Kontos jederzeit unter privacy@childcompass.app beantragen."
              : "You can request deletion of your account at any time at privacy@childcompass.app."}</p>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={privacyOk} onChange={e => setPrivacyOk(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer" />
            <span className="text-base font-medium leading-snug">
              {de
                ? "Ich habe die Datenschutzrichtlinie und die Nutzungsbedingungen gelesen und stimme zu."
                : "I have read and agree to the Privacy Policy and Terms of Service."}
            </span>
          </label>
          <div className="flex gap-3">
            <button onClick={prev} className={btnBack}>{de ? "← Zurück" : "← Back"}</button>
            <button
              onClick={() => { if (!privacyOk) { setError(de ? "Bitte Datenschutz bestätigen." : "Please accept the privacy policy."); return; } handleSubmit(); }}
              disabled={loading || !privacyOk}
              className={btnNext + " disabled:opacity-60"}>
              {loading ? (de ? "Wird erstellt…" : "Creating account…") : (de ? "Konto erstellen →" : "Create account →")}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5 — Verify */}
      {step === 5 && (
        <div className="text-center space-y-5 py-4">
          <div className="w-20 h-20 bg-blue-50 border-2 border-blue-100 rounded-full flex items-center justify-center mx-auto text-4xl">📬</div>
          <div>
            <h2 className="text-xl font-extrabold mb-2">{de ? "E-Mail bestätigen" : "Confirm your email"}</h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              {de ? "Wir haben einen Bestätigungslink gesendet an" : "We sent a confirmation link to"}<br />
              <strong className="text-foreground">{email}</strong>
            </p>
          </div>
          <div className="bg-muted/50 rounded-2xl p-4 text-base text-muted-foreground text-left space-y-2 border border-border">
            <p className="font-semibold text-foreground">{de ? "Nächste Schritte:" : "Next steps:"}</p>
            <p>1. {de ? "Posteingang öffnen" : "Open your email inbox"}</p>
            <p>2. {de ? "Auf den Bestätigungslink klicken" : "Click the Confirm your email link"}</p>
            <p>3. {de ? "Du wirst automatisch weitergeleitet." : "You'll be redirected to your dashboard automatically."}</p>
          </div>
          <p className="text-sm text-muted-foreground pt-2">
            {de ? "Keine E-Mail erhalten?" : "Didn't receive the email?"}{" "}
            <button type="button" onClick={handleResend} disabled={loading}
              className="text-primary font-bold hover:underline disabled:opacity-50">
              {loading ? (de ? "Wird gesendet…" : "Sending…") : (de ? "Erneut senden" : "Resend")}
            </button>
          </p>
          <p className="text-sm text-muted-foreground">{de ? "Auch den Spam-Ordner prüfen." : "Also check your spam or junk folder."}</p>
        </div>
      )}
    </div>
  );
}
