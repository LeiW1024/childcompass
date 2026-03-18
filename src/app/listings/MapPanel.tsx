"use client";
import dynamic from "next/dynamic";

const MapInner = dynamic(() => import("./MapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"#f8fafc" }}>
      <div style={{ background:"white", borderRadius:16, padding:"12px 20px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 4px 20px rgba(0,0,0,0.1)", border:"1px solid #e2e8f0" }}>
        <div style={{ width:18, height:18, borderRadius:"50%", border:"2px solid #3b82f6", borderTopColor:"transparent", animation:"spin 0.7s linear infinite" }} />
        <span style={{ fontSize:14, fontWeight:600, color:"#6b7280" }}>Karte wird geladen…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  ),
});

interface Listing {
  id: string; title: string; price: number; pricePer: string;
  category: string; latitude: number | null; longitude: number | null;
  providerProfile: { businessName: string };
}
interface Props {
  listings: Listing[];
  activeId: string | null;
  hoveredId: string | null;
  onMarkerClick: (listing: Listing) => void;
  onMarkerHover: (id: string | null) => void;
  TOKEN: string;
  lang: string;
}

export default function MapPanel(props: Props) {
  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      <MapInner {...props} />
    </div>
  );
}
