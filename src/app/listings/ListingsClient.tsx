"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLang, t, type Lang } from "@/components/ui/LanguageSwitcher";
import BookingModal from "@/components/BookingModal";
import {
  CATEGORY_ICONS, CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_BG,
  categoryLabel, formatAgeRange, type ListingCategory,
} from "@/types";

const MapPanel = dynamic(() => import("./MapPanel"), {
  ssr: false,
  loading: () => (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9" }}>
      <div style={{ background:"white", borderRadius:16, padding:"16px 28px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 4px 20px rgba(0,0,0,.1)", border:"1px solid #e2e8f0" }}>
        <div style={{ width:22, height:22, borderRadius:"50%", border:"3px solid #3b82f6", borderTopColor:"transparent", animation:"spin .7s linear infinite" }} />
        <span style={{ fontSize:17, fontWeight:600, color:"#475569" }}>Karte wird geladen…</span>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  ),
});

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Provider {
  businessName:string; logoUrl:string|null; city:string|null; address:string|null;
  description:string|null; phone:string|null; website:string|null; isClaimed:boolean;
}
export interface Listing {
  id:string; title:string; description:string; descriptionDe:string|null; category:ListingCategory;
  ageMinMonths:number; ageMaxMonths:number; price:number; pricePer:string;
  address:string|null; city:string|null; scheduleNotes:string|null;
  datePeriods:string|null; availableTimes:string|null; maxParticipants:number|null;
  imageUrl:string|null; latitude:number|null; longitude:number|null;
  providerProfile:Provider;
}

/* ─── Constants ─────────────────────────────────────────────────────────── */
const AGE_BANDS = [
  { de:"0–1 J.", en:"0–1 yr", min:0,  max:12 },
  { de:"1–2 J.", en:"1–2 yr", min:12, max:24 },
  { de:"2–4 J.", en:"2–4 yr", min:24, max:48 },
  { de:"5–6 J.", en:"5–6 yr", min:60, max:84 },
];
const ALL_CATS: ListingCategory[] = [
  "DAYCARE","PLAYGROUP","SPORTS","ARTS_CRAFTS","MUSIC",
  "LANGUAGE","SWIMMING","NATURE","EDUCATION","OTHER",
];
const PRICE_OPTS = [
  { de:"Alle",    en:"All",    v:null },
  { de:"< 50 €",  en:"< €50",  v:50   },
  { de:"< 100 €", en:"< €100", v:100  },
  { de:"< 200 €", en:"< €200", v:200  },
];
const DIST_OPTS = [
  { de:"Alle",    en:"All",   v:null },
  { de:"< 1 km",  en:"< 1 km", v:1   },
  { de:"< 2 km",  en:"< 2 km", v:2   },
  { de:"< 5 km",  en:"< 5 km", v:5   },
];

const PER_DE:Record<string,string> = { SESSION:"/ Einheit", MONTH:"/ Monat", WEEK:"/ Woche", YEAR:"/ Jahr" };
const PER_EN:Record<string,string> = { SESSION:"/ session", MONTH:"/ month", WEEK:"/ week",  YEAR:"/ year"  };
function perLabel(pricePer:string, lang:Lang) {
  return (lang==="de" ? PER_DE : PER_EN)[pricePer] ?? `/ ${pricePer.toLowerCase()}`;
}

const DAY_MAP: Record<string, string> = {
  monday:"Montag", mondays:"Montags", tuesday:"Dienstag", tuesdays:"Dienstags",
  wednesday:"Mittwoch", wednesdays:"Mittwochs", thursday:"Donnerstag", thursdays:"Donnerstags",
  friday:"Freitag", fridays:"Freitags", saturday:"Samstag", saturdays:"Samstags",
  sunday:"Sonntag", sundays:"Sonntags",
};
const DAY_RE = /\b(mondays?|tuesdays?|wednesdays?|thursdays?|fridays?|saturdays?|sundays?)\b/gi;

function locSchedule(text: string, lang: Lang): string {
  if (lang !== "de") return text;
  return text.replace(DAY_RE, m => DAY_MAP[m.toLowerCase()] ?? m);
}

function dKm(la1:number, lo1:number, la2:number, lo2:number) {
  const R=6371, dL=(la2-la1)*Math.PI/180, dl=(lo2-lo1)*Math.PI/180;
  const a=Math.sin(dL/2)**2+Math.cos(la1*Math.PI/180)*Math.cos(la2*Math.PI/180)*Math.sin(dl/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}
function bandFor(m:number){ return AGE_BANDS.find(b=>m>=b.min&&m<=b.max)??null; }

/* ─── Detail Modal ───────────────────────────────────────────────────────── */
function Modal({ listing, onClose, lang }:{ listing:Listing; onClose:()=>void; lang:Lang }) {
  const color = CATEGORY_COLORS[listing.category] ?? "#3b82f6";
  const bg    = CATEGORY_BG[listing.category]    ?? "#eff6ff";
  const p     = listing.providerProfile;
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fn = (e:KeyboardEvent) => { if (e.key==="Escape" && !showBooking) onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", fn); document.body.style.overflow=""; };
  }, [onClose, showBooking]);

  const mainModal = (
    <div
      onClick={onClose}
      style={{
        position:"fixed", inset:0, zIndex:200,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:24, background:"rgba(0,0,0,0.62)", backdropFilter:"blur(8px)",
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:"white", borderRadius:32, width:"100%",
          maxWidth:800, maxHeight:"90vh", overflowY:"auto",
          boxShadow:"0 40px 120px rgba(0,0,0,0.45)",
        }}
      >
        {/* ── Hero ── */}
        <div style={{
          height:260, position:"relative", borderRadius:"32px 32px 0 0",
          overflow:"hidden", background:`linear-gradient(135deg,${bg},${color}30)`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:100,
        }}>
          {listing.imageUrl
            ? <img src={listing.imageUrl} alt="" loading="lazy" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }} />
            : <span style={{ position:"relative", zIndex:1, filter:"drop-shadow(0 6px 16px rgba(0,0,0,0.18))" }}>{CATEGORY_ICONS[listing.category]}</span>}
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.28),transparent)" }} />
          {/* Close */}
          <button onClick={onClose} style={{
            position:"absolute", top:18, right:18, zIndex:10,
            width:46, height:46, borderRadius:"50%", border:"none",
            background:"rgba(255,255,255,0.96)", cursor:"pointer",
            fontSize:22, fontWeight:900, display:"flex", alignItems:"center", justifyContent:"center",
            boxShadow:"0 4px 20px rgba(0,0,0,0.22)", color:"#374151",
          }}>✕</button>
          {/* Category chip */}
          <span style={{
            position:"absolute", bottom:20, left:22, zIndex:10,
            fontSize:16, fontWeight:800, padding:"7px 20px",
            borderRadius:26, background:color, color:"white",
            boxShadow:"0 3px 12px rgba(0,0,0,0.22)",
          }}>
            {CATEGORY_ICONS[listing.category]} {categoryLabel(listing.category, lang)}
          </span>
        </div>

        {/* ── Body ── */}
        <div style={{ padding:"34px 40px 44px", display:"flex", flexDirection:"column", gap:28 }}>

          {/* Title + age */}
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:20 }}>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:32, fontWeight:900, margin:"0 0 10px", lineHeight:1.15, color:"#0f172a" }}>
                {listing.title}
              </h2>
              <p style={{ fontSize:19, color:"#64748b", margin:0, fontWeight:500 }}>
                {lang === "de" ? "von" : "by"} <strong style={{ color:"#334155" }}>{p.businessName}</strong>
              </p>
            </div>
            <span style={{
              fontSize:16, fontWeight:700, padding:"9px 20px",
              borderRadius:26, flexShrink:0, marginTop:4,
              background:"#fffbeb", color:"#92400e", border:"2px solid #fde68a",
            }}>
              👶 {formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths)}
            </span>
          </div>

          {/* ── PRICE SPOTLIGHT ── */}
          <div style={{
            display:"flex", alignItems:"center", gap:28,
            background:`linear-gradient(135deg,${bg},${color}18)`,
            border:`2.5px solid ${color}44`, borderRadius:24,
            padding:"24px 32px",
          }}>
            <div>
              <div style={{ fontSize:52, fontWeight:900, color, lineHeight:1 }}>
                {Number(listing.price) === 0 ? t("free", lang) : `${listing.price%1===0 ? listing.price : listing.price.toFixed(2)} €`}
              </div>
              {Number(listing.price) !== 0 && (
                <div style={{ fontSize:21, fontWeight:700, color, marginTop:6 }}>
                  {perLabel(listing.pricePer, lang)}
                </div>
              )}
            </div>
            <div style={{ flex:1, borderLeft:`2px solid ${color}33`, paddingLeft:28 }}>
              {listing.scheduleNotes && (
                <p style={{ margin:"0 0 7px", fontSize:17, fontWeight:600, color:"#334155" }}>
                  📅 {locSchedule(listing.scheduleNotes, lang)}
                </p>
              )}
              {listing.datePeriods && (
                <p style={{ margin:"0 0 7px", fontSize:16, color:"#64748b" }}>🗓 {locSchedule(listing.datePeriods, lang)}</p>
              )}
              {listing.availableTimes && (
                <p style={{ margin:0, fontSize:16, color:"#64748b" }}>🕐 {locSchedule(listing.availableTimes, lang)}</p>
              )}
            </div>
          </div>

          {/* Info tiles */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            {[
              { icon:"📍", label:lang==="de"?"Ort":"Location",
                val:[listing.address, listing.city].filter(Boolean).join(", ")||"—" },
              { icon:"👥", label:lang==="de"?"Plätze":"Spots",
                val:listing.maxParticipants?`Max ${listing.maxParticipants} Kinder`:"—" },
            ].map(({ icon, label, val })=>(
              <div key={label} style={{ background:"#f8fafc", borderRadius:18, padding:"18px 22px", border:"1px solid #e2e8f0" }}>
                <p style={{ margin:"0 0 7px", fontSize:13, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:1 }}>
                  {icon} {label}
                </p>
                <p style={{ margin:0, fontSize:18, fontWeight:600, color:"#1e293b", lineHeight:1.4 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <h3 style={{ fontSize:22, fontWeight:800, margin:"0 0 14px", color:"#0f172a" }}>
              {lang==="de"?"Über diese Aktivität":"About this activity"}
            </h3>
            <p style={{ fontSize:18, color:"#475569", lineHeight:1.8, margin:0 }}>
              {lang === "de" ? listing.descriptionDe ?? listing.description : listing.description}
            </p>
          </div>

          {/* Provider */}
          <div style={{
            background:"#f8fafc", borderRadius:22, padding:24,
            display:"flex", alignItems:"flex-start", gap:20,
            border:"1px solid #e2e8f0",
          }}>
            <div style={{
              width:62, height:62, borderRadius:18, background:bg,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:32, flexShrink:0, overflow:"hidden",
            }}>
              {p.logoUrl ? <img src={p.logoUrl} loading="lazy" style={{ width:"100%", height:"100%", objectFit:"cover" }} alt="" /> : "🏫"}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                <span style={{ fontSize:20, fontWeight:800, color:"#0f172a" }}>{p.businessName}</span>
                {p.isClaimed&&<span style={{ fontSize:14, background:"#f0fdf4", color:"#15803d", fontWeight:700, padding:"4px 14px", borderRadius:22, border:"1.5px solid #bbf7d0" }}>✓ Verifiziert</span>}
              </div>
              {p.city   &&<p style={{ margin:"0 0 4px", fontSize:17, color:"#64748b" }}>📍 {p.city}</p>}
              {p.phone  &&<p style={{ margin:"0 0 4px", fontSize:17, color:"#64748b" }}>📞 {p.phone}</p>}
              {p.website&&<a href={p.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:17, fontWeight:600, color, textDecoration:"none", display:"inline-block", marginTop:2 }}>🔗 {p.website}</a>}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setShowBooking(true)}
            style={{
              display:"flex", alignItems:"center", justifyContent:"center", gap:14,
              background:color, color:"white", fontWeight:800, fontSize:20,
              padding:"22px 0", borderRadius:22, border:"none", cursor:"pointer",
              boxShadow:`0 8px 28px ${color}55`, width:"100%",
              transition:"all .15s",
            }}
          >
            ✉️ {lang==="de"?"Jetzt anfragen & buchen":"Request & book now"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mainModal}
      {showBooking && (
        <BookingModal
          listing={{
            id: listing.id,
            title: listing.title,
            price: Number(listing.price),
            pricePer: listing.pricePer,
            address: listing.address,
            availableTimes: listing.availableTimes,
            providerProfile: { businessName: p.businessName },
          }}
          lang={lang}
          onClose={() => setShowBooking(false)}
        />
      )}
    </>
  );
}

/* ─── Activity Card ──────────────────────────────────────────────────────── */
function Card({ listing, active, hovered, onClick, onEnter, onLeave, lang, userPos }:{
  listing:Listing; active:boolean; hovered:boolean;
  onClick:()=>void; onEnter:()=>void; onLeave:()=>void;
  lang:Lang; userPos:{lat:number;lng:number}|null;
}) {
  const color = CATEGORY_COLORS[listing.category] ?? "#3b82f6";
  const bg    = CATEGORY_BG[listing.category]    ?? "#eff6ff";
  const hi    = active || hovered;
  const dist  = (userPos && listing.latitude && listing.longitude)
    ? dKm(userPos.lat, userPos.lng, listing.latitude, listing.longitude) : null;

  return (
    <div
      onClick={onClick} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        background:"white", borderRadius:20, overflow:"hidden", cursor:"pointer",
        border:`2.5px solid ${hi ? color : "#e8edf2"}`,
        boxShadow:active
          ? `0 6px 28px ${color}33, inset 5px 0 0 ${color}`
          : hovered ? `0 3px 18px ${color}22` : "0 1px 6px rgba(0,0,0,0.06)",
        transform:active?"translateX(4px)":"none",
        transition:"border-color .15s, box-shadow .15s, transform .15s",
      }}
    >
      <div style={{ display:"flex" }}>
        {/* Thumbnail */}
        <div style={{
          width:110, flexShrink:0, position:"relative",
          background:`linear-gradient(145deg,${bg},${color}18)`,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:40, alignSelf:"stretch",
        }}>
          {listing.imageUrl
            ?<img src={listing.imageUrl} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>
            :<span style={{ position:"relative", zIndex:1 }}>{CATEGORY_ICONS[listing.category]}</span>}
          <span style={{
            position:"absolute", bottom:0, left:0, right:0,
            textAlign:"center", padding:"4px 3px",
            fontSize:10, fontWeight:800, letterSpacing:0.3,
            background:`${color}ee`, color:"white", lineHeight:1.5,
          }}>
            {categoryLabel(listing.category, lang).toUpperCase()}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding:"14px 14px 14px 16px", flex:1, minWidth:0, display:"flex", flexDirection:"column" }}>

          {/* Top row: title (left) + price+age badge (right) */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
            {/* Title */}
            <h3 style={{
              fontSize:15, fontWeight:800, lineHeight:1.3, margin:0, color:"#0f172a", flex:1, minWidth:0,
              display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden",
            }}>
              {listing.title}
            </h3>

            {/* Price + age badge — top right */}
            <div style={{
              flexShrink:0, textAlign:"right",
              background:`${color}12`, border:`1.5px solid ${color}33`,
              borderRadius:12, padding:"5px 10px",
            }}>
              <div style={{ fontSize:18, fontWeight:900, color, lineHeight:1.1, whiteSpace:"nowrap" }}>
                {Number(listing.price) === 0
                  ? t("free", lang)
                  : <>{listing.price%1===0 ? listing.price : listing.price.toFixed(0)} €
                    <span style={{ fontSize:11, fontWeight:600, color:"#94a3b8", marginLeft:3 }}>
                      {perLabel(listing.pricePer, lang)}
                    </span>
                  </>}
              </div>
              <div style={{ fontSize:11, fontWeight:700, color, marginTop:2, whiteSpace:"nowrap" }}>
                👶 {formatAgeRange(listing.ageMinMonths, listing.ageMaxMonths)}
              </div>
            </div>
          </div>

          {/* Provider */}
          <p style={{ fontSize:13, color:"#64748b", margin:"0 0 5px", display:"flex", alignItems:"center", gap:5, fontWeight:500 }}>
            🏫 <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>{listing.providerProfile.businessName}</span>
            {listing.providerProfile.isClaimed&&<span style={{ color:"#16a34a", fontSize:13, flexShrink:0 }}>✓</span>}
          </p>

          {/* Meta tags */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"3px 12px", fontSize:12, color:"#64748b", marginBottom:8 }}>
            {listing.address&&<span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:160 }}>📍 {listing.address}</span>}
            {dist!==null&&<span style={{ color, fontWeight:700 }}>📡 {dist<1?`${(dist*1000).toFixed(0)} m`:`${dist.toFixed(1)} km`}</span>}
            {listing.availableTimes&&<span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>🕐 {locSchedule(listing.availableTimes, lang)}</span>}
          </div>

          {/* Description snippet */}
          <p style={{ fontSize:12, color:"#94a3b8", margin:"0 0 10px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
            {lang === "de" ? listing.descriptionDe ?? listing.description : listing.description}
          </p>

          {/* CTA */}
          <button style={{
            fontSize:13, fontWeight:700, padding:"6px 16px", borderRadius:10, alignSelf:"flex-start",
            border:`2px solid ${color}`, color:hi?"white":color,
            background:hi?color:"transparent", transition:"all .12s", cursor:"pointer",
          }}>
            {lang==="de"?"Details ansehen →":"View details →"}
          </button>
        </div>
      </div>
    </div>
  );
}


/* ─── Pill factory ──────────────────────────────────────────────────────── */
function pill(active:boolean, ac:string, bg:string): React.CSSProperties {
  return {
    height:38, padding:"0 14px", borderRadius:20, fontSize:14, fontWeight:700,
    cursor:"pointer", whiteSpace:"nowrap", flexShrink:0, lineHeight:1,
    display:"inline-flex", alignItems:"center", gap:4,
    border:`1.5px solid ${active ? ac : `${ac}44`}`,
    background:active ? ac : bg, color:active?"white":ac,
    transition:"all .12s",
  };
}

/* ─── Main ──────────────────────────────────────────────────────────────── */
export default function ListingsClient({ initialListings, mapboxToken, initialAge }:{
  initialListings:Listing[]; mapboxToken:string; initialAge?:number|null;
}) {
  const { lang } = useLang();

  const [query,   setQuery]   = useState("");
  const [cats,    setCats]    = useState<ListingCategory[]>([]);
  const [band,    setBand]    = useState<typeof AGE_BANDS[number]|null>(
    initialAge!=null ? bandFor(initialAge) : null
  );
  const [maxP,    setMaxP]    = useState<number|null>(null);
  const [maxD,    setMaxD]    = useState<number|null>(null);
  const [userPos, setUserPos] = useState<{lat:number;lng:number}|null>(null);
  const [activeId, setActiveId] = useState<string|null>(null);
  const [hoverId,  setHoverId]  = useState<string|null>(null);
  const [modal,    setModal]    = useState<Listing|null>(null);
  const refs = useRef<Map<string,HTMLDivElement>>(new Map());

  useEffect(() => {
    if (maxD == null || userPos) return;
    // 1. Try real device GPS first (accurate to metres)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => setUserPos({ lat: p.coords.latitude, lng: p.coords.longitude }),
        () => {
          // GPS denied — fall back to IP geolocation
          fetch("https://ipapi.co/json/")
            .then(r => r.json())
            .then(d => { if (d.latitude && d.longitude) setUserPos({ lat: d.latitude, lng: d.longitude }); })
            .catch(() => {});
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      fetch("https://ipapi.co/json/")
        .then(r => r.json())
        .then(d => { if (d.latitude && d.longitude) setUserPos({ lat: d.latitude, lng: d.longitude }); })
        .catch(() => {});
    }
  }, [maxD, userPos]);

  const toggleCat = useCallback((c:ListingCategory) =>
    setCats(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]), []);

  const filtered = useMemo(() => initialListings.filter(l => {
    if (cats.length>0&&!cats.includes(l.category)) return false;
    if (band&&(l.ageMinMonths>band.max||l.ageMaxMonths<band.min)) return false;
    if (maxP&&l.price>maxP) return false;
    if (maxD&&userPos&&l.latitude&&l.longitude&&
        dKm(userPos.lat,userPos.lng,l.latitude,l.longitude)>maxD) return false;
    if (query) {
      const q=query.toLowerCase();
      if (!l.title.toLowerCase().includes(q)&&
          !l.description?.toLowerCase().includes(q)&&
          !l.providerProfile.businessName.toLowerCase().includes(q)) return false;
    }
    return true;
  }), [initialListings, cats, band, maxP, maxD, userPos, query]);

  function openCard(l:Listing) { setActiveId(l.id); setModal(l); }
  function onMarkerClick(l: { id: string }) {
    setActiveId(l.id);
    const full = initialListings.find(x => x.id === l.id);
    if (full) setModal(full);
    setTimeout(()=>refs.current.get(l.id)?.scrollIntoView({ behavior:"smooth", block:"nearest" }), 50);
  }
  const onEnter = useCallback((id:string) => setHoverId(id), []);
  const onLeave = useCallback(() => setHoverId(null), []);
  const onHover = useCallback((id:string|null) => setHoverId(id), []);

  return (
    <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>

      {/* ═══════════════════════════════════════════════════════
          FILTER BAR — single scrollable line
      ═══════════════════════════════════════════════════════ */}
      <div style={{ background:"white", borderBottom:"2px solid #e8edf2", flexShrink:0, boxShadow:"0 2px 10px rgba(0,0,0,.06)", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, overflowX:"auto", scrollbarWidth:"none" }}>

        {/* Search */}
        <div style={{ position:"relative", flexShrink:0, width:200 }}>
          <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", fontSize:15, color:"#94a3b8", pointerEvents:"none" }}>🔍</span>
          <input
            value={query} onChange={e=>setQuery(e.target.value)}
            placeholder={lang==="de"?"Suchen…":"Search…"}
            style={{
              width:"100%", height:38, paddingLeft:34, paddingRight:10,
              borderRadius:20, border:"1.5px solid #e2e8f0",
              fontSize:14, outline:"none", background:"#f8fafc",
              boxSizing:"border-box", fontFamily:"inherit",
            }}
          />
        </div>

        <div style={{ width:1, height:28, background:"#e2e8f0", flexShrink:0 }} />

        {/* Age */}
        <span style={{ fontSize:12, fontWeight:800, color:"#94a3b8", flexShrink:0, textTransform:"uppercase", letterSpacing:.5 }}>
          {lang==="de"?"Alter":"Age"}
        </span>
        <button onClick={()=>setBand(null)} style={pill(band===null,"#1e293b","#f1f5f9")}>
          {lang==="de"?"Alle":"All"}
        </button>
        {AGE_BANDS.map(b => {
          const a = band?.min===b.min&&band?.max===b.max;
          return (
            <button key={b.min} onClick={()=>setBand(a?null:b)} style={pill(a,"#3b82f6","#eff6ff")}>
              {lang==="de"?b.de:b.en}
            </button>
          );
        })}

        <div style={{ width:1, height:28, background:"#e2e8f0", flexShrink:0 }} />

        {/* Price */}
        <span style={{ fontSize:12, fontWeight:800, color:"#94a3b8", flexShrink:0, textTransform:"uppercase", letterSpacing:.5 }}>
          {lang==="de"?"Preis":"Price"}
        </span>
        {PRICE_OPTS.map(o => {
          const a = o.v === null ? maxP === null : maxP === o.v;
          return (
            <button key={String(o.v)} onClick={() => setMaxP(o.v)} style={pill(a,"#10b981","#f0fdf4")}>
              {lang==="de"?o.de:o.en}
            </button>
          );
        })}

        <div style={{ width:1, height:28, background:"#e2e8f0", flexShrink:0 }} />

        {/* Distance */}
        <span style={{ fontSize:12, fontWeight:800, color:"#94a3b8", flexShrink:0, textTransform:"uppercase", letterSpacing:.5 }}>
          {lang==="de"?"Entf.":"Dist."}
        </span>
        {DIST_OPTS.map(o => {
          const a = o.v === null ? maxD === null : maxD === o.v;
          return (
            <button key={String(o.v)} onClick={() => setMaxD(o.v)} style={pill(a,"#f59e0b","#fffbeb")}>
              {lang==="de"?o.de:o.en}
            </button>
          );
        })}

        <div style={{ width:1, height:28, background:"#e2e8f0", flexShrink:0 }} />

        {/* Categories */}
        <span style={{ fontSize:12, fontWeight:800, color:"#94a3b8", flexShrink:0, textTransform:"uppercase", letterSpacing:.5 }}>
          {lang==="de"?"Kat.":"Cat."}
        </span>
        <button onClick={()=>setCats([])} style={pill(cats.length===0,"#1e293b","#f1f5f9")}>
          {lang==="de"?"Alle":"All"}
        </button>
        {ALL_CATS.map(cat=>{
          const a  = cats.includes(cat);
          const co = CATEGORY_COLORS[cat];
          const cbg = CATEGORY_BG[cat];
          return (
            <button key={cat} onClick={()=>toggleCat(cat)} style={pill(a,co,cbg)}>
              <span style={{ fontSize:14 }}>{CATEGORY_ICONS[cat]}</span>
              <span>{categoryLabel(cat, lang)}</span>
              {a&&<span style={{ fontSize:12, opacity:.8 }}>✓</span>}
            </button>
          );
        })}

        {/* Count */}
        <span style={{ marginLeft:"auto", fontSize:13, fontWeight:700, color:"#94a3b8", whiteSpace:"nowrap", flexShrink:0 }}>
          {filtered.length} {lang==="de"?"Akt.":"act."}
        </span>
      </div>

      {/* ═══════════════════════════════════════════════════════
          SPLIT: cards | map
      ═══════════════════════════════════════════════════════ */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>

        {/* Cards */}
        <div style={{
          width:"43%", flexShrink:0, overflowY:"auto",
          background:"#f8fafc", padding:14,
          display:"flex", flexDirection:"column", gap:12,
          borderRight:"2px solid #e8edf2",
        }}>
          {filtered.length===0?(
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:260, textAlign:"center", padding:24 }}>
              <p style={{ fontSize:48, marginBottom:16 }}>🔍</p>
              <p style={{ fontWeight:800, fontSize:20, marginBottom:8, color:"#1e293b" }}>
                {lang==="de"?"Keine Aktivitäten gefunden":"No activities found"}
              </p>
              <p style={{ fontSize:16, color:"#94a3b8" }}>
                {lang==="de"?"Filter anpassen":"Try adjusting your filters"}
              </p>
            </div>
          ):filtered.map(l=>(
            <div key={l.id} ref={el=>{ if(el) refs.current.set(l.id,el); else refs.current.delete(l.id); }}>
              <Card
                listing={l}
                active={activeId===l.id}
                hovered={hoverId===l.id}
                onClick={()=>openCard(l)}
                onEnter={()=>onEnter(l.id)}
                onLeave={onLeave}
                lang={lang}
                userPos={userPos}
              />
            </div>
          ))}
        </div>

        {/* Map */}
        <div style={{ flex:1, position:"relative", minHeight:0, minWidth:0 }}>
          {mapboxToken?(
            <MapPanel
              listings={filtered} activeId={activeId} hoveredId={hoverId}
              onMarkerClick={onMarkerClick} onMarkerHover={onHover}
              TOKEN={mapboxToken} lang={lang}
            />
          ):(
            <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc", textAlign:"center", padding:32 }}>
              <div>
                <p style={{ fontSize:48, marginBottom:12 }}>🗺️</p>
                <p style={{ fontWeight:700, fontSize:18, marginBottom:8 }}>Mapbox token fehlt</p>
                <p style={{ fontSize:15, color:"#6b7280" }}>NEXT_PUBLIC_MAPBOX_TOKEN in .env.local eintragen</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal&&(
        <Modal listing={modal} lang={lang} onClose={()=>{ setModal(null); setActiveId(null); }}/>
      )}
    </div>
  );
}
