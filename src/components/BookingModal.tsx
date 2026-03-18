"use client";
// components/BookingModal.tsx — full booking flow modal
import { useState, useEffect, useCallback } from "react";

interface Child  { id: string; firstName: string; dateOfBirth: string; }
interface Listing {
  id: string; title: string; price: number; pricePer: string;
  address: string | null; availableTimes: string | null;
  providerProfile: { businessName: string; email?: string; };
}

interface Props {
  listing: Listing;
  lang: string;
  onClose: () => void;
}

const GENDER_OPTS = [
  { value: "male",   label: { de: "Junge 👦", en: "Boy 👦" } },
  { value: "female", label: { de: "Mädchen 👧", en: "Girl 👧" } },
  { value: "other",  label: { de: "Divers 🌈", en: "Other 🌈" } },
];

const PER_DE: Record<string, string> = { SESSION:"/ Einheit", MONTH:"/ Monat", WEEK:"/ Woche", YEAR:"/ Jahr" };
const PER_EN: Record<string, string> = { SESSION:"/ session", MONTH:"/ month", WEEK:"/ week", YEAR:"/ year" };

function ageLabel(dob: string, lang: string) {
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (months < 24) return lang === "de" ? `${months} Monate` : `${months} months`;
  const years = Math.floor(months / 12);
  return lang === "de" ? `${years} Jahre` : `${years} years`;
}

type Step = "select-child" | "create-child" | "confirm" | "success" | "loading";

export default function BookingModal({ listing, lang, onClose }: Props) {
  const de = lang === "de";
  const [step, setStep] = useState<Step>("loading");
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Create-child form
  const [newName, setNewName]   = useState("");
  const [newGender, setNewGender] = useState("male");
  const [newDob, setNewDob]     = useState("");
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/children");
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setChildren(data ?? []);
      setStep(data?.length ? "select-child" : "create-child");
    } catch {
      setStep("create-child");
    }
  }, []);

  useEffect(() => { loadChildren(); }, [loadChildren]);

  async function handleCreateChild() {
    if (!newName.trim() || !newDob) {
      setError(de ? "Bitte Name und Geburtstag angeben." : "Please enter name and birthday.");
      return;
    }
    setCreating(true); setError("");
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: newName.trim(), gender: newGender, dateOfBirth: newDob }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Fehler");
      const { data } = json;
      setChildren(prev => [...prev, data]);
      setSelectedChild(data);
      setStep("confirm");
    } catch {
      setError(de ? "Fehler beim Anlegen des Profils." : "Error creating profile.");
    } finally { setCreating(false); }
  }

  async function handleSubmitBooking() {
    if (!selectedChild) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, childId: selectedChild.id, message }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "error");
      setStep("success");
    } catch {
      setError(de ? "Fehler beim Senden. Bitte erneut versuchen." : "Error sending. Please try again.");
    } finally { setSubmitting(false); }
  }

  // ── backdrop + card ────────────────────────────────────────
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:999,
        background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:16,
      }}
    >
      <div style={{
        background:"white", borderRadius:28, width:"100%", maxWidth:480,
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.25)",
        fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif",
      }}>

        {/* ── Header ── */}
        <div style={{
          background:"linear-gradient(135deg,#2563eb,#1d4ed8)",
          borderRadius:"28px 28px 0 0", padding:"24px 24px 20px",
          color:"white", position:"relative",
        }}>
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16,
            background:"rgba(255,255,255,0.2)", border:"none", borderRadius:50,
            width:32, height:32, cursor:"pointer", color:"white", fontSize:18, lineHeight:1,
          }}>✕</button>
          <p style={{ fontSize:12, fontWeight:700, opacity:.8, marginBottom:4 }}>
            {de ? "Buchungsanfrage" : "Booking Request"}
          </p>
          <h2 style={{ fontSize:18, fontWeight:900, margin:0, lineHeight:1.3 }}>{listing.title}</h2>
          <p style={{ fontSize:13, opacity:.8, marginTop:6 }}>
            🏫 {listing.providerProfile.businessName}
            {listing.address && <span>  ·  📍 {listing.address}</span>}
          </p>
          <div style={{
            marginTop:12, display:"inline-flex", alignItems:"baseline", gap:4,
            background:"rgba(255,255,255,0.18)", borderRadius:10, padding:"4px 12px",
          }}>
            <span style={{ fontSize:22, fontWeight:900 }}>{listing.price} €</span>
            <span style={{ fontSize:13, opacity:.85 }}>
              {(de ? PER_DE : PER_EN)[listing.pricePer] ?? ""}
            </span>
          </div>
        </div>

        <div style={{ padding:24 }}>

          {/* ── LOADING ── */}
          {step === "loading" && (
            <div style={{ textAlign:"center", padding:32, color:"#64748b" }}>
              <div style={{ fontSize:36 }}>⏳</div>
              <p style={{ marginTop:12 }}>{de ? "Wird geladen…" : "Loading…"}</p>
            </div>
          )}

          {/* ── SELECT CHILD ── */}
          {step === "select-child" && (
            <>
              <h3 style={{ fontSize:16, fontWeight:800, margin:"0 0 4px", color:"#0f172a" }}>
                {de ? "Für welches Kind?" : "For which child?"}
              </h3>
              <p style={{ fontSize:13, color:"#64748b", margin:"0 0 16px" }}>
                {de ? "Wähle ein Kinderprofil für diese Buchung." : "Select a child profile for this booking."}
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:16 }}>
                {children.map(child => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child)}
                    style={{
                      display:"flex", alignItems:"center", gap:14, padding:"12px 16px",
                      borderRadius:16, border:`2px solid ${selectedChild?.id === child.id ? "#2563eb" : "#e2e8f0"}`,
                      background:selectedChild?.id === child.id ? "#eff6ff" : "white",
                      cursor:"pointer", textAlign:"left", transition:"all .12s",
                    }}
                  >
                    <div style={{
                      width:44, height:44, borderRadius:"50%",
                      background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:20, fontWeight:900, color:"#2563eb", flexShrink:0,
                    }}>
                      {child.firstName[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:800, fontSize:15, margin:0, color:"#0f172a" }}>{child.firstName}</p>
                      <p style={{ fontSize:12, color:"#64748b", margin:0 }}>
                        {ageLabel(child.dateOfBirth, lang)}
                      </p>
                    </div>
                    {selectedChild?.id === child.id && (
                      <span style={{ marginLeft:"auto", color:"#2563eb", fontSize:20 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep("create-child")}
                style={{
                  width:"100%", padding:"10px", borderRadius:12,
                  border:"2px dashed #cbd5e1", background:"transparent",
                  color:"#64748b", fontSize:13, fontWeight:700, cursor:"pointer",
                  marginBottom:20,
                }}
              >
                + {de ? "Neues Kinderprofil hinzufügen" : "Add new child profile"}
              </button>

              {error && <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>{error}</p>}

              <button
                onClick={() => selectedChild && setStep("confirm")}
                disabled={!selectedChild}
                style={{
                  width:"100%", padding:"14px", borderRadius:16,
                  background:selectedChild ? "#2563eb" : "#e2e8f0",
                  color:selectedChild ? "white" : "#94a3b8",
                  border:"none", fontSize:16, fontWeight:800,
                  cursor:selectedChild ? "pointer" : "not-allowed", transition:"all .15s",
                }}
              >
                {de ? "Weiter →" : "Continue →"}
              </button>
            </>
          )}

          {/* ── CREATE CHILD ── */}
          {step === "create-child" && (
            <>
              <button
                onClick={() => children.length ? setStep("select-child") : null}
                style={{
                  background:"none", border:"none", color:"#2563eb",
                  fontSize:13, fontWeight:700, cursor:children.length ? "pointer" : "default",
                  padding:0, marginBottom:16, display:children.length ? "block" : "none",
                }}
              >
                ← {de ? "Zurück" : "Back"}
              </button>

              <h3 style={{ fontSize:16, fontWeight:800, margin:"0 0 4px", color:"#0f172a" }}>
                {de ? "Kinderprofil erstellen" : "Create child profile"}
              </h3>
              <p style={{ fontSize:13, color:"#64748b", margin:"0 0 20px" }}>
                {de
                  ? "Lege ein Profil für dein Kind an, um Buchungsanfragen zu senden."
                  : "Create a profile for your child to send booking requests."}
              </p>

              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                    {de ? "Vorname *" : "First name *"}
                  </label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder={de ? "z. B. Emma" : "e.g. Emma"}
                    style={{
                      width:"100%", padding:"10px 14px", borderRadius:12, boxSizing:"border-box",
                      border:"2px solid #e2e8f0", fontSize:15, fontFamily:"inherit",
                      outline:"none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                    {de ? "Geschlecht" : "Gender"}
                  </label>
                  <div style={{ display:"flex", gap:8 }}>
                    {GENDER_OPTS.map(g => (
                      <button
                        key={g.value}
                        onClick={() => setNewGender(g.value)}
                        style={{
                          flex:1, padding:"8px 6px", borderRadius:12, fontSize:13, fontWeight:700,
                          border:`2px solid ${newGender === g.value ? "#2563eb" : "#e2e8f0"}`,
                          background:newGender === g.value ? "#eff6ff" : "white",
                          color:newGender === g.value ? "#2563eb" : "#374151",
                          cursor:"pointer", transition:"all .12s",
                        }}
                      >
                        {g.label[lang as "de"|"en"] ?? g.label.de}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                    {de ? "Geburtstag *" : "Birthday *"}
                  </label>
                  <input
                    type="date"
                    value={newDob}
                    max={new Date().toISOString().split("T")[0]}
                    onChange={e => setNewDob(e.target.value)}
                    style={{
                      width:"100%", padding:"10px 14px", borderRadius:12, boxSizing:"border-box",
                      border:"2px solid #e2e8f0", fontSize:15, fontFamily:"inherit",
                      outline:"none",
                    }}
                  />
                </div>
              </div>

              {error && <p style={{ color:"#dc2626", fontSize:13, marginTop:12, marginBottom:0 }}>{error}</p>}

              <button
                onClick={handleCreateChild}
                disabled={creating}
                style={{
                  width:"100%", marginTop:20, padding:"14px", borderRadius:16,
                  background: creating ? "#93c5fd" : "#2563eb",
                  color:"white", border:"none", fontSize:16, fontWeight:800,
                  cursor:creating ? "not-allowed" : "pointer", transition:"all .15s",
                }}
              >
                {creating
                  ? (de ? "Wird erstellt…" : "Creating…")
                  : (de ? "Profil erstellen →" : "Create profile →")}
              </button>
            </>
          )}

          {/* ── CONFIRM ── */}
          {step === "confirm" && selectedChild && (
            <>
              <button
                onClick={() => setStep(children.length > 0 ? "select-child" : "create-child")}
                style={{
                  background:"none", border:"none", color:"#2563eb",
                  fontSize:13, fontWeight:700, cursor:"pointer",
                  padding:0, marginBottom:16,
                }}
              >
                ← {de ? "Zurück" : "Back"}
              </button>

              <h3 style={{ fontSize:16, fontWeight:800, margin:"0 0 16px", color:"#0f172a" }}>
                {de ? "Anfrage bestätigen" : "Confirm request"}
              </h3>

              {/* Summary card */}
              <div style={{
                background:"#f8fafc", borderRadius:16, padding:16, marginBottom:20,
                border:"2px solid #e2e8f0",
              }}>
                <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                  <div style={{
                    width:48, height:48, borderRadius:"50%",
                    background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:22, fontWeight:900, color:"#2563eb",
                  }}>
                    {selectedChild.firstName[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight:800, fontSize:15, margin:0, color:"#0f172a" }}>{selectedChild.firstName}</p>
                    <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{ageLabel(selectedChild.dateOfBirth, lang)}</p>
                  </div>
                </div>
                <div style={{ borderTop:"1px solid #e2e8f0", paddingTop:12 }}>
                  <p style={{ fontSize:13, color:"#374151", margin:"0 0 4px" }}>
                    <strong>{de ? "Aktivität:" : "Activity:"}</strong> {listing.title}
                  </p>
                  <p style={{ fontSize:13, color:"#374151", margin:"0 0 4px" }}>
                    <strong>{de ? "Anbieter:" : "Provider:"}</strong> {listing.providerProfile.businessName}
                  </p>
                  {listing.availableTimes && (
                    <p style={{ fontSize:13, color:"#374151", margin:"0 0 4px" }}>
                      <strong>{de ? "Zeiten:" : "Times:"}</strong> {listing.availableTimes}
                    </p>
                  )}
                  <p style={{ fontSize:13, color:"#374151", margin:0 }}>
                    <strong>{de ? "Preis:" : "Price:"}</strong> {listing.price} €{" "}
                    {(de ? PER_DE : PER_EN)[listing.pricePer] ?? ""}
                  </p>
                </div>
              </div>

              {/* Optional message */}
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                  {de ? "Nachricht an den Anbieter (optional)" : "Message to provider (optional)"}
                </label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  placeholder={de
                    ? "z. B. Besondere Bedürfnisse, Fragen zum Kurs…"
                    : "e.g. Special needs, questions about the course…"}
                  style={{
                    width:"100%", padding:"10px 14px", borderRadius:12, boxSizing:"border-box",
                    border:"2px solid #e2e8f0", fontSize:14, fontFamily:"inherit",
                    outline:"none", resize:"vertical",
                  }}
                />
              </div>

              {error && <p style={{ color:"#dc2626", fontSize:13, marginBottom:12 }}>{error}</p>}

              <button
                onClick={handleSubmitBooking}
                disabled={submitting}
                style={{
                  width:"100%", padding:"14px", borderRadius:16,
                  background:submitting ? "#93c5fd" : "#2563eb",
                  color:"white", border:"none", fontSize:16, fontWeight:800,
                  cursor:submitting ? "not-allowed" : "pointer", transition:"all .15s",
                }}
              >
                {submitting
                  ? (de ? "Wird gesendet…" : "Sending…")
                  : (de ? "✉️ Anfrage absenden" : "✉️ Send request")}
              </button>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === "success" && (
            <div style={{ textAlign:"center", padding:"16px 8px 8px" }}>
              <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
              <h3 style={{ fontSize:22, fontWeight:900, margin:"0 0 8px", color:"#0f172a" }}>
                {de ? "Anfrage gesendet!" : "Request sent!"}
              </h3>
              <p style={{ fontSize:14, color:"#64748b", margin:"0 0 6px" }}>
                {de
                  ? `Deine Buchungsanfrage für ${selectedChild?.firstName} wurde an`
                  : `Your booking request for ${selectedChild?.firstName} has been sent to`}
              </p>
              <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 20px" }}>
                {listing.providerProfile.businessName}
              </p>
              <div style={{
                background:"#f0fdf4", border:"2px solid #bbf7d0",
                borderRadius:16, padding:14, marginBottom:24, textAlign:"left",
              }}>
                <p style={{ fontSize:13, color:"#15803d", fontWeight:700, margin:"0 0 4px" }}>
                  {de ? "Was passiert jetzt?" : "What happens next?"}
                </p>
                <p style={{ fontSize:13, color:"#166534", margin:0 }}>
                  {de
                    ? "Der Anbieter wird deine Anfrage prüfen und sich bei dir melden. Du kannst den Status in deiner Übersicht verfolgen."
                    : "The provider will review your request and get back to you. You can track the status in your overview."}
                </p>
              </div>
              <div style={{ display:"flex", gap:10 }}>
                <button
                  onClick={() => window.location.href = "/dashboard/parent"}
                  style={{
                    flex:1, padding:"12px", borderRadius:14,
                    background:"#2563eb", color:"white", border:"none",
                    fontSize:14, fontWeight:800, cursor:"pointer",
                  }}
                >
                  {de ? "Meine Buchungen →" : "My Bookings →"}
                </button>
                <button
                  onClick={onClose}
                  style={{
                    flex:1, padding:"12px", borderRadius:14,
                    background:"white", color:"#374151",
                    border:"2px solid #e2e8f0",
                    fontSize:14, fontWeight:700, cursor:"pointer",
                  }}
                >
                  {de ? "Schließen" : "Close"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
