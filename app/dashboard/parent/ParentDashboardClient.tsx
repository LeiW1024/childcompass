"use client";
// app/dashboard/parent/ParentDashboardClient.tsx
import { useState } from "react";
import Link from "next/link";
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG } from "@/types";

/* ── Types ── */
interface Child {
  id: string; firstName: string; dateOfBirth: string;
}
interface Provider {
  businessName: string; phone?: string | null; website?: string | null;
  city?: string | null; isClaimed: boolean;
}
interface Listing {
  id: string; title: string; description: string; category: string;
  price: number; pricePer: string; address: string | null;
  availableTimes: string | null; scheduleNotes: string | null;
  datePeriods: string | null; maxParticipants: number | null;
  providerProfile: Provider;
}
interface Booking {
  id: string; status: string; message: string | null;
  createdAt: string; respondedAt: string | null;
  listing: Listing; child: Child;
}
interface Profile {
  id: string; fullName: string | null; email: string;
}

/* ── Constants ── */
const STATUS: Record<string, { label: string; labelDe: string; emoji: string; bg: string; text: string; border: string }> = {
  REQUESTED: { label:"Pending",   labelDe:"Ausstehend",  emoji:"⏳", bg:"#fffbeb", text:"#92400e", border:"#fde68a" },
  CONFIRMED: { label:"Confirmed", labelDe:"Bestätigt",   emoji:"✅", bg:"#f0fdf4", text:"#166534", border:"#bbf7d0" },
  DECLINED:  { label:"Declined",  labelDe:"Abgelehnt",   emoji:"❌", bg:"#fef2f2", text:"#991b1b", border:"#fecaca" },
  CANCELLED: { label:"Cancelled", labelDe:"Storniert",   emoji:"🚫", bg:"#f8fafc", text:"#475569", border:"#e2e8f0" },
};
const PER_DE: Record<string, string> = { SESSION:"/ Einheit", MONTH:"/ Monat", WEEK:"/ Woche", YEAR:"/ Jahr" };
const PER_EN: Record<string, string> = { SESSION:"/ session", MONTH:"/ month", WEEK:"/ week", YEAR:"/ year" };
const GENDER_OPTS = [
  { v:"male",   de:"Junge 👦",    en:"Boy 👦"   },
  { v:"female", de:"Mädchen 👧", en:"Girl 👧"  },
  { v:"other",  de:"Divers 🌈",   en:"Other 🌈" },
];

function ageStr(dob: string) {
  const m = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  if (m < 24) return `${m} Monate`;
  return `${Math.floor(m / 12)} Jahre`;
}

/* ── Child card ── */
function ChildCard({ child, onDelete }: { child: Child; onDelete: (id: string) => void }) {
  const [conf, setConf] = useState(false);
  return (
    <div style={{
      background:"white", borderRadius:20, border:"2px solid #e2e8f0",
      padding:"16px 18px", display:"flex", alignItems:"center", gap:14,
      transition:"border-color .15s, box-shadow .15s",
    }}>
      <div style={{
        width:52, height:52, borderRadius:"50%", flexShrink:0,
        background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:22, fontWeight:900, color:"#2563eb",
      }}>
        {child.firstName[0].toUpperCase()}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontWeight:800, fontSize:16, margin:0, color:"#0f172a" }}>{child.firstName}</p>
        <p style={{ fontSize:13, color:"#64748b", margin:"2px 0 0" }}>{ageStr(child.dateOfBirth)}</p>
      </div>
      {conf ? (
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => onDelete(child.id)} style={{
            fontSize:12, fontWeight:700, padding:"5px 12px", borderRadius:10,
            background:"#dc2626", color:"white", border:"none", cursor:"pointer",
          }}>Löschen</button>
          <button onClick={() => setConf(false)} style={{
            fontSize:12, fontWeight:700, padding:"5px 12px", borderRadius:10,
            background:"#f1f5f9", color:"#374151", border:"none", cursor:"pointer",
          }}>Abbrechen</button>
        </div>
      ) : (
        <button onClick={() => setConf(true)} style={{
          fontSize:12, color:"#94a3b8", background:"none", border:"none", cursor:"pointer",
        }}>✕</button>
      )}
    </div>
  );
}

/* ── AddChildForm ── */
function AddChildForm({ onAdded }: { onAdded: (child: Child) => void }) {
  const [open, setOpen]     = useState(false);
  const [name, setName]     = useState("");
  const [gender, setGender] = useState("male");
  const [dob, setDob]       = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr]       = useState("");

  async function submit() {
    if (!name.trim() || !dob) { setErr("Name und Geburtstag erforderlich."); return; }
    setLoading(true); setErr("");
    const res = await fetch("/api/children", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ firstName:name.trim(), gender, dateOfBirth:dob }),
    });
    if (!res.ok) { setErr("Fehler beim Erstellen."); setLoading(false); return; }
    const { data } = await res.json();
    onAdded(data);
    setName(""); setGender("male"); setDob(""); setOpen(false);
    setLoading(false);
  }

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        width:"100%", padding:"14px", borderRadius:20,
        border:"2.5px dashed #cbd5e1", background:"transparent",
        color:"#64748b", fontSize:15, fontWeight:700, cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      }}
    >
      + Kind hinzufügen
    </button>
  );

  return (
    <div style={{
      background:"#f8fafc", borderRadius:20, border:"2px solid #e2e8f0", padding:20,
    }}>
      <h4 style={{ fontSize:15, fontWeight:800, margin:"0 0 16px", color:"#0f172a" }}>
        Neues Kinderprofil
      </h4>
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <div>
          <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>Vorname *</label>
          <input value={name} onChange={e=>setName(e.target.value)}
            placeholder="z. B. Emma"
            style={{ width:"100%", padding:"9px 13px", borderRadius:12, border:"2px solid #e2e8f0",
              fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
        </div>
        <div>
          <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>Geschlecht</label>
          <div style={{ display:"flex", gap:8 }}>
            {GENDER_OPTS.map(g => (
              <button key={g.v} onClick={() => setGender(g.v)} style={{
                flex:1, padding:"8px 4px", borderRadius:12, fontSize:12, fontWeight:700,
                border:`2px solid ${gender===g.v ? "#2563eb" : "#e2e8f0"}`,
                background:gender===g.v ? "#eff6ff" : "white",
                color:gender===g.v ? "#2563eb" : "#374151", cursor:"pointer",
              }}>{g.de}</button>
            ))}
          </div>
        </div>
        <div>
          <label style={{ fontSize:13, fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>Geburtstag *</label>
          <input type="date" value={dob} onChange={e=>setDob(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            style={{ width:"100%", padding:"9px 13px", borderRadius:12, border:"2px solid #e2e8f0",
              fontSize:14, fontFamily:"inherit", outline:"none", boxSizing:"border-box" }} />
        </div>
        {err && <p style={{ color:"#dc2626", fontSize:13, margin:0 }}>{err}</p>}
        <div style={{ display:"flex", gap:10, marginTop:4 }}>
          <button onClick={submit} disabled={loading} style={{
            flex:1, padding:"11px", borderRadius:14, background:loading?"#93c5fd":"#2563eb",
            color:"white", border:"none", fontSize:14, fontWeight:800,
            cursor:loading?"not-allowed":"pointer",
          }}>
            {loading ? "Wird erstellt…" : "Profil erstellen"}
          </button>
          <button onClick={() => setOpen(false)} style={{
            flex:1, padding:"11px", borderRadius:14, background:"white",
            color:"#374151", border:"2px solid #e2e8f0", fontSize:14, fontWeight:700, cursor:"pointer",
          }}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

/* ── Booking Detail Modal ── */
function BookingDetailModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const sc = STATUS[booking.status] ?? STATUS.REQUESTED;
  const color = (CATEGORY_COLORS as any)[booking.listing.category] ?? "#3b82f6";
  const bg    = (CATEGORY_BG as any)[booking.listing.category]    ?? "#eff6ff";
  const icon  = (CATEGORY_ICONS as any)[booking.listing.category] ?? "🎯";

  return (
    <div
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
      style={{
        position:"fixed", inset:0, zIndex:999, background:"rgba(0,0,0,0.55)",
        backdropFilter:"blur(6px)", display:"flex", alignItems:"center",
        justifyContent:"center", padding:16,
        fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif",
      }}
    >
      <div style={{
        background:"white", borderRadius:28, width:"100%", maxWidth:520,
        maxHeight:"90vh", overflowY:"auto",
        boxShadow:"0 32px 80px rgba(0,0,0,0.28)",
      }}>
        {/* Hero */}
        <div style={{
          background:`linear-gradient(135deg,${bg},${color}30)`,
          borderRadius:"28px 28px 0 0", padding:"28px 24px 24px",
          position:"relative",
        }}>
          <button onClick={onClose} style={{
            position:"absolute", top:16, right:16,
            background:"rgba(255,255,255,0.85)", border:"none", borderRadius:50,
            width:34, height:34, cursor:"pointer", fontSize:18, lineHeight:1,
          }}>✕</button>
          <div style={{ fontSize:52, marginBottom:10 }}>{icon}</div>
          <h2 style={{ fontSize:20, fontWeight:900, margin:"0 0 4px", color:"#0f172a", lineHeight:1.25 }}>
            {booking.listing.title}
          </h2>
          <p style={{ fontSize:14, color:"#64748b", margin:"0 0 12px" }}>
            🏫 {booking.listing.providerProfile.businessName}
          </p>
          {/* Status badge */}
          <span style={{
            display:"inline-flex", alignItems:"center", gap:6, fontSize:13, fontWeight:800,
            padding:"6px 16px", borderRadius:24,
            background:sc.bg, color:sc.text, border:`1.5px solid ${sc.border}`,
          }}>
            {sc.emoji} {sc.labelDe}
          </span>
        </div>

        <div style={{ padding:"24px 24px 28px", display:"flex", flexDirection:"column", gap:20 }}>

          {/* For whom */}
          <div style={{ display:"flex", alignItems:"center", gap:14,
            background:"#f8fafc", borderRadius:16, padding:"14px 16px" }}>
            <div style={{
              width:46, height:46, borderRadius:"50%", flexShrink:0,
              background:"linear-gradient(135deg,#dbeafe,#bfdbfe)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:20, fontWeight:900, color:"#2563eb",
            }}>{booking.child.firstName[0].toUpperCase()}</div>
            <div>
              <p style={{ fontSize:12, color:"#94a3b8", fontWeight:700, margin:"0 0 2px" }}>ANGEMELDET FÜR</p>
              <p style={{ fontSize:16, fontWeight:800, color:"#0f172a", margin:0 }}>{booking.child.firstName}</p>
              <p style={{ fontSize:12, color:"#64748b", margin:0 }}>{ageStr(booking.child.dateOfBirth)}</p>
            </div>
          </div>

          {/* Activity details */}
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <h3 style={{ fontSize:14, fontWeight:800, color:"#94a3b8", margin:0, textTransform:"uppercase", letterSpacing:.5 }}>
              Aktivitätsdetails
            </h3>
            {[
              booking.listing.address && ["📍 Ort", booking.listing.address],
              booking.listing.availableTimes && ["🕐 Zeiten", booking.listing.availableTimes],
              booking.listing.datePeriods && ["🗓 Zeitraum", booking.listing.datePeriods],
              booking.listing.maxParticipants && ["👥 Plätze", `Max. ${booking.listing.maxParticipants} Kinder`],
              ["💶 Preis", `${booking.listing.price} € ${PER_DE[booking.listing.pricePer] ?? ""}`],
            ].filter(Boolean).map((row: any) => (
              <div key={row[0]} style={{ display:"flex", justifyContent:"space-between", gap:12,
                padding:"10px 14px", background:"#f8fafc", borderRadius:12 }}>
                <span style={{ fontSize:13, color:"#64748b", fontWeight:600 }}>{row[0]}</span>
                <span style={{ fontSize:13, color:"#0f172a", fontWeight:700, textAlign:"right" }}>{row[1]}</span>
              </div>
            ))}
          </div>

          {/* Provider contact */}
          <div style={{ background:"#f8fafc", borderRadius:16, padding:"14px 16px" }}>
            <p style={{ fontSize:12, color:"#94a3b8", fontWeight:700, margin:"0 0 8px", textTransform:"uppercase", letterSpacing:.5 }}>Anbieter</p>
            <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>
              {booking.listing.providerProfile.businessName}
              {booking.listing.providerProfile.isClaimed && (
                <span style={{ fontSize:11, background:"#f0fdf4", color:"#15803d", fontWeight:700,
                  padding:"2px 10px", borderRadius:20, marginLeft:8, border:"1px solid #bbf7d0" }}>✓</span>
              )}
            </p>
            {booking.listing.providerProfile.city && (
              <p style={{ fontSize:13, color:"#64748b", margin:"0 0 4px" }}>📍 {booking.listing.providerProfile.city}</p>
            )}
            {booking.listing.providerProfile.phone && (
              <a href={`tel:${booking.listing.providerProfile.phone}`}
                style={{ fontSize:13, color:"#2563eb", fontWeight:700, display:"block", margin:"0 0 4px", textDecoration:"none" }}>
                📞 {booking.listing.providerProfile.phone}
              </a>
            )}
            {booking.listing.providerProfile.website && (
              <a href={booking.listing.providerProfile.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:13, color:"#2563eb", fontWeight:700, display:"block", textDecoration:"none" }}>
                🔗 Website besuchen
              </a>
            )}
          </div>

          {/* Optional message */}
          {booking.message && (
            <div style={{ background:"#fffbeb", borderRadius:16, padding:"14px 16px", border:"1.5px solid #fde68a" }}>
              <p style={{ fontSize:12, color:"#92400e", fontWeight:700, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:.5 }}>
                Deine Nachricht
              </p>
              <p style={{ fontSize:14, color:"#78350f", margin:0, lineHeight:1.6 }}>{booking.message}</p>
            </div>
          )}

          {/* Status-specific banners */}
          {booking.status === "CONFIRMED" && (
            <div style={{ background:"#f0fdf4", borderRadius:16, padding:"16px 18px", border:"2px solid #bbf7d0" }}>
              <p style={{ fontSize:15, fontWeight:800, color:"#166534", margin:"0 0 4px" }}>🎉 Platz bestätigt!</p>
              <p style={{ fontSize:13, color:"#166534", margin:0 }}>
                Dein Platz ist gesichert. Kontaktiere den Anbieter für weitere Details.
              </p>
            </div>
          )}
          {booking.status === "DECLINED" && (
            <div style={{ background:"#fef2f2", borderRadius:16, padding:"16px 18px", border:"2px solid #fecaca" }}>
              <p style={{ fontSize:15, fontWeight:800, color:"#991b1b", margin:"0 0 4px" }}>Anfrage abgelehnt</p>
              <p style={{ fontSize:13, color:"#991b1b", margin:0 }}>
                Leider wurde deine Anfrage abgelehnt. Schau dir andere Aktivitäten an.
              </p>
              <Link href="/listings" style={{ display:"inline-block", marginTop:10, fontSize:13, fontWeight:800,
                color:"#2563eb", textDecoration:"none" }}>
                Andere Aktivitäten finden →
              </Link>
            </div>
          )}
          {booking.status === "REQUESTED" && (
            <div style={{ background:"#fffbeb", borderRadius:16, padding:"16px 18px", border:"2px solid #fde68a" }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#92400e", margin:0 }}>
                ⏳ Deine Anfrage wartet auf die Rückmeldung des Anbieters.
              </p>
            </div>
          )}

          {/* Dates */}
          <p style={{ fontSize:12, color:"#94a3b8", margin:0, textAlign:"right" }}>
            Angefragt am {new Date(booking.createdAt).toLocaleDateString("de-DE", { day:"2-digit", month:"long", year:"numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Cancel × Button ── */
function CancelXButton({ bookingId, onCancelled }: { bookingId: string; onCancelled: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function doCancel(e: React.MouseEvent) {
    e.stopPropagation();
    setLoading(true);
    await onCancelled(bookingId);
    setLoading(false);
    setConfirm(false);
  }

  if (!confirm) return (
    <button
      onClick={e => { e.stopPropagation(); setConfirm(true); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title="Buchung stornieren"
      style={{
        position: "absolute", top: 10, right: 10,
        width: 26, height: 26, borderRadius: "50%",
        border: hovered ? "1.5px solid #fca5a5" : "1.5px solid #e2e8f0",
        background: hovered ? "#fef2f2" : "white",
        color: hovered ? "#dc2626" : "#94a3b8",
        fontSize: 14, fontWeight: 900, lineHeight: 1,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all .15s",
        zIndex: 2,
      }}
    >
      ×
    </button>
  );

  return (
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: "absolute", top: 8, right: 8,
        background: "white", border: "1.5px solid #fca5a5",
        borderRadius: 14, padding: "6px 10px",
        display: "flex", alignItems: "center", gap: 6,
        boxShadow: "0 4px 16px rgba(220,38,38,0.15)",
        zIndex: 10,
      }}
    >
      <span style={{ fontSize: 12, color: "#991b1b", fontWeight: 700, whiteSpace: "nowrap" }}>
        Stornieren?
      </span>
      <button onClick={doCancel} disabled={loading} style={{
        fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 8,
        background: "#dc2626", color: "white", border: "none", cursor: "pointer",
      }}>
        {loading ? "…" : "Ja"}
      </button>
      <button onClick={e => { e.stopPropagation(); setConfirm(false); }} style={{
        fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8,
        background: "#f1f5f9", color: "#374151", border: "none", cursor: "pointer",
      }}>
        Nein
      </button>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function ParentDashboardClient({
  profile, initialChildren, initialBookings,
}: {
  profile: Profile;
  initialChildren: Child[];
  initialBookings: Booking[];
}) {
  const [tab, setTab]           = useState<"children"|"bookings">("bookings");
  const [children, setChildren] = useState<Child[]>(initialChildren);
  const [bookings, setBookings]  = useState<Booking[]>(initialBookings);
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);

  const firstName = profile.fullName?.split(" ")[0] ?? "there";
  const confirmed = bookings.filter(b => b.status === "CONFIRMED").length;
  const pending   = bookings.filter(b => b.status === "REQUESTED").length;

  async function handleCancelBooking(id: string) {
    const res = await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CANCELLED" }),
    });
    if (res.ok) {
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "CANCELLED" } : b));
    }
  }

  function handleDeleteChild(id: string) {
    fetch(`/api/children/${id}`, { method: "DELETE" });
    setChildren(prev => prev.filter(c => c.id !== id));
  }

  const tabBtn = (active: boolean) => ({
    flex: 1 as const, padding: "11px 8px", borderRadius: 14,
    border: "none", fontSize: 15, fontWeight: 800 as const, cursor: "pointer" as const,
    background: active ? "#2563eb" : "white",
    color: active ? "white" : "#64748b",
    transition: "all .15s",
  });

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 60px",
      fontFamily: "'Plus Jakarta Sans',system-ui,sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
        borderRadius: 28, padding: "28px 28px 24px", color: "white",
        marginBottom: 24, position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position:"absolute", inset:0, opacity:.07,
          backgroundImage:"radial-gradient(circle at 80% 10%, white 1px, transparent 1px)",
          backgroundSize:"28px 28px",
        }} />
        <div style={{ position:"relative", zIndex:1, display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ fontSize:13, fontWeight:700, opacity:.75, margin:"0 0 4px" }}>Willkommen zurück 👋</p>
            <h1 style={{ fontSize:28, fontWeight:900, margin:"0 0 4px", letterSpacing:-.5 }}>
              {firstName}s Übersicht
            </h1>
            <p style={{ fontSize:13, opacity:.75, margin:0 }}>
              {children.length} {children.length === 1 ? "Kind" : "Kinder"} · {bookings.length} Buchungen
            </p>
          </div>
          <Link href="/listings" style={{
            background:"white", color:"#2563eb", fontWeight:800, fontSize:13,
            padding:"9px 18px", borderRadius:16, textDecoration:"none",
            boxShadow:"0 4px 14px rgba(0,0,0,0.18)", whiteSpace:"nowrap",
          }}>
            🔍 Aktivitäten finden
          </Link>
        </div>

        {/* Stats */}
        <div style={{ position:"relative", zIndex:1, display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:12, marginTop:20 }}>
          {[
            { n: bookings.length, label: "Gesamt",      emoji:"📋" },
            { n: pending,         label: "Ausstehend",  emoji:"⏳" },
            { n: confirmed,       label: "Bestätigt",   emoji:"🎉" },
          ].map(s => (
            <div key={s.label} style={{
              background:"rgba(255,255,255,0.15)", borderRadius:16, padding:"12px 8px", textAlign:"center",
            }}>
              <p style={{ fontSize:24, fontWeight:900, margin:0 }}>{s.n}</p>
              <p style={{ fontSize:11, opacity:.8, margin:"2px 0 0", fontWeight:600 }}>{s.emoji} {s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{
        display:"flex", gap:8, background:"#f1f5f9", padding:6, borderRadius:18,
        marginBottom:24,
      }}>
        <button onClick={() => setTab("bookings")} style={tabBtn(tab === "bookings")}>
          📋 Meine Buchungen {bookings.length > 0 && (
            <span style={{
              marginLeft:6, background:tab==="bookings"?"rgba(255,255,255,0.3)":"#e2e8f0",
              color:tab==="bookings"?"white":"#64748b",
              borderRadius:20, fontSize:12, fontWeight:800, padding:"1px 8px",
            }}>{bookings.length}</span>
          )}
        </button>
        <button onClick={() => setTab("children")} style={tabBtn(tab === "children")}>
          👶 Meine Kinder {children.length > 0 && (
            <span style={{
              marginLeft:6, background:tab==="children"?"rgba(255,255,255,0.3)":"#e2e8f0",
              color:tab==="children"?"white":"#64748b",
              borderRadius:20, fontSize:12, fontWeight:800, padding:"1px 8px",
            }}>{children.length}</span>
          )}
        </button>
      </div>

      {/* ── BOOKINGS TAB ── */}
      {tab === "bookings" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {bookings.length === 0 ? (
            <div style={{
              background:"white", borderRadius:24, border:"2.5px dashed #e2e8f0",
              padding:"60px 24px", textAlign:"center",
            }}>
              <p style={{ fontSize:52, margin:"0 0 12px" }}>🎯</p>
              <p style={{ fontSize:20, fontWeight:900, margin:"0 0 6px", color:"#0f172a" }}>Noch keine Buchungen</p>
              <p style={{ fontSize:14, color:"#64748b", margin:"0 0 20px" }}>
                Entdecke Aktivitäten in Erfurt und sende deine erste Anfrage!
              </p>
              <Link href="/listings" style={{
                display:"inline-block", background:"#2563eb", color:"white",
                fontWeight:800, fontSize:15, padding:"12px 28px", borderRadius:16, textDecoration:"none",
              }}>
                Aktivitäten entdecken
              </Link>
            </div>
          ) : (
            bookings.map(b => {
              const sc = STATUS[b.status] ?? STATUS.REQUESTED;
              const color = (CATEGORY_COLORS as any)[b.listing.category] ?? "#3b82f6";
              const bg    = (CATEGORY_BG as any)[b.listing.category]    ?? "#eff6ff";
              const icon  = (CATEGORY_ICONS as any)[b.listing.category] ?? "🎯";
              return (
                <div
                  key={b.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetailBooking(b)}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setDetailBooking(b); }}
                  style={{
                    display:"block", width:"100%", textAlign:"left",
                    background:"white", borderRadius:20,
                    border:`2px solid #e2e8f0`,
                    padding:0, cursor:"pointer",
                    transition:"border-color .15s, box-shadow .15s",
                    boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                    position:"relative",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = color;
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 18px ${color}22`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)";
                  }}
                >
                  <div style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:14 }}>
                    {/* Icon */}
                    <div style={{
                      width:52, height:52, borderRadius:16, flexShrink:0,
                      background:`linear-gradient(135deg,${bg},${color}22)`,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
                    }}>
                      {icon}
                    </div>
                    {/* Info */}
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                        <p style={{ fontSize:15, fontWeight:800, color:"#0f172a", margin:0,
                          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:220 }}>
                          {b.listing.title}
                        </p>
                        <span style={{
                          flexShrink:0, fontSize:11, fontWeight:800, padding:"4px 10px",
                          borderRadius:20, background:sc.bg, color:sc.text, border:`1px solid ${sc.border}`,
                          whiteSpace:"nowrap",
                        }}>
                          {sc.emoji} {sc.labelDe}
                        </span>
                      </div>
                      <p style={{ fontSize:13, color:"#64748b", margin:"3px 0 0" }}>
                        🏫 {b.listing.providerProfile.businessName}
                      </p>
                      <div style={{ display:"flex", gap:12, marginTop:5, fontSize:12, color:"#94a3b8" }}>
                        <span>👶 {b.child.firstName}</span>
                        <span>💶 {b.listing.price} € {PER_DE[b.listing.pricePer] ?? ""}</span>
                        {b.listing.availableTimes && <span>🕐 {b.listing.availableTimes}</span>}
                      </div>
                    </div>
                    <span style={{ color:"#cbd5e1", fontSize:18, flexShrink:0 }}>›</span>
                  </div>
                  {/* × cancel button — top-right corner, only for active bookings */}
                  {(b.status === "REQUESTED" || b.status === "CONFIRMED") && (
                    <CancelXButton bookingId={b.id} onCancelled={handleCancelBooking} />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── CHILDREN TAB ── */}
      {tab === "children" && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {children.length === 0 && (
            <div style={{
              background:"#fffbeb", border:"2px solid #fde68a",
              borderRadius:20, padding:"20px 22px", marginBottom:4,
            }}>
              <p style={{ fontSize:15, fontWeight:800, color:"#92400e", margin:"0 0 4px" }}>
                👶 Noch kein Kinderprofil
              </p>
              <p style={{ fontSize:13, color:"#78350f", margin:0 }}>
                Erstelle ein Kinderprofil, um Buchungsanfragen für deine Kinder zu senden.
              </p>
            </div>
          )}
          {children.map(child => (
            <ChildCard key={child.id} child={child} onDelete={handleDeleteChild} />
          ))}
          <AddChildForm onAdded={child => setChildren(prev => [...prev, child])} />
        </div>
      )}

      {/* ── Booking detail modal ── */}
      {detailBooking && (
        <BookingDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
        />
      )}
    </div>
  );
}
