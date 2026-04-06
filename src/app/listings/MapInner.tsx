"use client";
// MapInner.tsx — browser only (imported with ssr:false)

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CATEGORY_COLORS as CAT_COLORS, categoryLabel, type ListingCategory } from "@/types";

const ERFURT: [number, number] = [11.0328, 50.9848];

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

const CAT_ICONS: Record<string, string> = {
  DAYCARE:"🏠", PLAYGROUP:"👫", SPORTS:"⚽", ARTS_CRAFTS:"🎨",
  MUSIC:"🎵", LANGUAGE:"🗣️", SWIMMING:"🏊", NATURE:"🌿", EDUCATION:"📚", OTHER:"🎯",
};

const MAPBOX_LANG: Record<string, string> = { en: "en", de: "de" };

interface Listing {
  id: string; title: string; price: number; pricePer: string;
  category: string; latitude: number | null; longitude: number | null;
  providerProfile: { businessName: string };
}
interface Props {
  listings: Listing[];
  activeId: string | null;
  hoveredId: string | null;
  onMarkerClick: (l: Listing) => void;
  onMarkerHover: (id: string | null) => void;
  TOKEN: string;
  lang: string;
}

export default function MapInner({ listings, activeId, hoveredId, onMarkerClick, onMarkerHover, TOKEN, lang }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<mapboxgl.Map | null>(null);
  const markersRef   = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const popupRef     = useRef<mapboxgl.Popup | null>(null);
  const [ready, setReady] = useState(false);

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !TOKEN) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: ERFURT,
      zoom: 12,
      attributionControl: false,
      localIdeographFontFamily: false as unknown as string,
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate, "bottom-right");

    map.on("load", () => {
      mapRef.current = map;
      setMapLanguage(map, lang);
      setReady(true);
    });
    return () => { map.remove(); mapRef.current = null; setReady(false); };
  }, [TOKEN]); // eslint-disable-line

  // ── Language ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return;
    setMapLanguage(mapRef.current, lang);
  }, [lang, ready]);

  function setMapLanguage(map: mapboxgl.Map, language: string) {
    try {
      const mlang = MAPBOX_LANG[language] ?? "de";
      map.getStyle()?.layers?.forEach((layer: any) => {
        if (layer.type === "symbol" && layer.layout?.["text-field"]) {
          map.setLayoutProperty(layer.id, "text-field", [
            "coalesce", ["get", `name_${mlang}`], ["get", "name"],
          ]);
        }
      });
    } catch (e) { console.warn("Map language update failed:", e); }
  }

  // Store refs for event handlers so markers don't need recreation when callbacks change
  const onMarkerClickRef = useRef(onMarkerClick);
  const onMarkerHoverRef = useRef(onMarkerHover);
  const langRef = useRef(lang);
  useEffect(() => { onMarkerClickRef.current = onMarkerClick; }, [onMarkerClick]);
  useEffect(() => { onMarkerHoverRef.current = onMarkerHover; }, [onMarkerHover]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  // ── Sync markers (only when listings change) ────────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    // Remove stale markers
    const visibleIds = new Set(listings.filter(l => l.latitude && l.longitude).map(l => l.id));
    markersRef.current.forEach((marker, id) => {
      if (!visibleIds.has(id)) { marker.remove(); markersRef.current.delete(id); }
    });

    listings.forEach(listing => {
      if (!listing.latitude || !listing.longitude) return;
      if (markersRef.current.has(listing.id)) return;

      const color = (CAT_COLORS as Record<string, string>)[listing.category] ?? "#6b7280";

      const wrapper = document.createElement("div");
      wrapper.style.cssText = "display:inline-block; overflow:visible;";

      const pill = document.createElement("div");
      pill.style.cssText = [
        `background:${color}`,
        "color:white",
        "border:2.5px solid white",
        "border-radius:20px",
        "padding:4px 10px",
        "font-size:11px",
        "font-weight:800",
        "box-shadow:0 3px 12px rgba(0,0,0,0.22)",
        "cursor:pointer",
        "white-space:nowrap",
        "transition:transform 0.15s cubic-bezier(.34,1.56,.64,1), box-shadow 0.15s ease",
        "user-select:none",
      ].join(";");
      pill.dataset.listingId = listing.id;
      pill.dataset.price = String(listing.price);
      pill.textContent = Number(listing.price) === 0
        ? (langRef.current === "de" ? "k.A." : "N/A")
        : `€${listing.price % 1 === 0 ? listing.price : Number(listing.price).toFixed(0)}`;

      const tip = document.createElement("div");
      tip.style.cssText = [
        "position:absolute",
        "bottom:calc(100% + 6px)",
        "left:50%",
        "transform:translateX(-50%)",
        "background:#1e293b",
        "color:white",
        "font-size:11px",
        "font-weight:700",
        "padding:5px 10px",
        "border-radius:10px",
        "white-space:nowrap",
        "pointer-events:none",
        "opacity:0",
        "transition:opacity 0.15s ease",
        "box-shadow:0 4px 12px rgba(0,0,0,0.25)",
        "z-index:999",
      ].join(";");

      const maxBiz = listing.providerProfile.businessName.slice(0, 22);
      const maxTitle = listing.title.slice(0, 28);
      tip.textContent = `${maxBiz} · ${maxTitle}`;

      const arrow = document.createElement("div");
      arrow.style.cssText = [
        "position:absolute",
        "top:100%",
        "left:50%",
        "transform:translateX(-50%)",
        "border:5px solid transparent",
        "border-top-color:#1e293b",
        "width:0",
        "height:0",
      ].join(";");
      tip.appendChild(arrow);

      wrapper.appendChild(pill);
      wrapper.appendChild(tip);

      pill.addEventListener("mouseenter", () => {
        pill.style.transform = "scale(1.2)";
        pill.style.boxShadow = `0 6px 20px ${color}88`;
        tip.style.opacity = "1";
        onMarkerHoverRef.current(listing.id);
      });
      pill.addEventListener("mouseleave", () => {
        pill.style.transform = "scale(1)";
        pill.style.boxShadow = "0 3px 12px rgba(0,0,0,0.22)";
        tip.style.opacity = "0";
        onMarkerHoverRef.current(null);
      });
      pill.addEventListener("click", e => {
        e.stopPropagation();
        onMarkerClickRef.current(listing);
        popupRef.current?.remove();
        const curLang = langRef.current;
        const curPriceLabel = Number(listing.price) === 0
          ? (curLang === "de" ? "k.A." : "N/A")
          : `€${listing.price % 1 === 0 ? listing.price : Number(listing.price).toFixed(0)}`;
        const popup = new mapboxgl.Popup({
          offset: 18, closeButton: true, maxWidth: "260px",
          className: "childcompass-popup",
        })
          .setLngLat([listing.longitude!, listing.latitude!])
          .setHTML(`
            <div style="font-family:system-ui,sans-serif;padding:2px">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <span style="font-size:22px;flex-shrink:0">${escapeHtml(CAT_ICONS[listing.category] ?? "🎯")}</span>
                <div style="min-width:0">
                  <p style="font-size:12px;font-weight:800;margin:0;line-height:1.3">${escapeHtml(listing.title)}</p>
                  <p style="font-size:10px;color:#64748b;margin:2px 0 0">${escapeHtml(listing.providerProfile.businessName)}</p>
                </div>
              </div>
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                <span style="font-size:14px;font-weight:800;color:${escapeHtml(color)}">${escapeHtml(curPriceLabel)}</span>
                <span style="font-size:10px;background:${escapeHtml(color)}22;color:${escapeHtml(color)};font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap">${escapeHtml(categoryLabel(listing.category as ListingCategory, curLang as "en" | "de"))}</span>
              </div>
            </div>
          `)
          .addTo(mapRef.current!);
        popupRef.current = popup;
      });

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: "center" })
        .setLngLat([listing.longitude, listing.latitude])
        .addTo(mapRef.current!);
      markersRef.current.set(listing.id, marker);
    });
  }, [ready, listings]);

  // ── Update marker labels on language change (no recreation) ─────────────
  useEffect(() => {
    markersRef.current.forEach((marker) => {
      const pill = marker.getElement()?.querySelector("div") as HTMLElement | null;
      if (!pill || !pill.dataset.price) return;
      const price = Number(pill.dataset.price);
      pill.textContent = price === 0
        ? (lang === "de" ? "k.A." : "N/A")
        : `€${price % 1 === 0 ? price : price.toFixed(0)}`;
    });
  }, [lang]);

  // ── Highlight active (clicked from card) ─────────────────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const wrapper = marker.getElement();
      const pill = wrapper?.querySelector("div") as HTMLElement | null;
      if (!pill) return;
      if (id === activeId) {
        pill.style.transform = "scale(1.3)";
        pill.style.zIndex = "20";
        pill.style.boxShadow = `0 0 0 3px white, 0 0 0 5px ${(CAT_COLORS as Record<string, string>)[marker.getElement().querySelector("div")?.style.background ?? ""] ?? "#3b82f6"}`;
        wrapper.style.zIndex = "20";
        mapRef.current?.flyTo({ center: marker.getLngLat(), zoom: 14, duration: 700, essential: true });
      } else {
        pill.style.transform = "scale(1)";
        pill.style.zIndex = "1";
        pill.style.boxShadow = "0 3px 12px rgba(0,0,0,0.22)";
        wrapper.style.zIndex = "1";
      }
    });
  }, [activeId]);

  // ── Highlight hovered (hovered card → glow marker) ───────────────────────
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const wrapper = marker.getElement();
      const pill = wrapper?.querySelector("div") as HTMLElement | null;
      if (!pill) return;
      // Don't override active state
      if (id === activeId) return;
      if (id === hoveredId) {
        pill.style.transform = "scale(1.15)";
        wrapper.style.zIndex = "10";
      } else {
        pill.style.transform = "scale(1)";
        wrapper.style.zIndex = "1";
      }
    });
  }, [hoveredId, activeId]);


  if (!TOKEN) return (
    <div style={{ width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc",textAlign:"center",padding:24 }}>
      <div><p style={{ fontSize:40,marginBottom:8 }}>🗺️</p><p style={{ fontWeight:700,marginBottom:4 }}>Map token missing</p><p style={{ fontSize:12,color:"#6b7280" }}>Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p></div>
    </div>
  );

  return (
    <div style={{ position:"relative", width:"100%", height:"100%" }}>
      <div ref={containerRef} style={{ position:"absolute", top:0, left:0, right:0, bottom:0 }} />


      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .childcompass-popup .mapboxgl-popup-content {
          border-radius: 16px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.18) !important;
          padding: 14px 16px !important;
          border: 1.5px solid #e2e8f0 !important;
        }
        .childcompass-popup .mapboxgl-popup-close-button {
          font-size:16px !important; color:#94a3b8 !important; padding:4px 8px !important;
        }
        .childcompass-popup .mapboxgl-popup-tip { border-top-color:white !important; }
      `}</style>
    </div>
  );
}
