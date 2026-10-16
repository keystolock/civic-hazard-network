"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MOCK_INCIDENTS, MAP_CENTER, SEVERITY_CONFIG } from "@/lib/mockData";
import type { Incident, SeverityLevel } from "@/lib/types";

// Fix missing default icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/** Colored circle marker per severity */
function makeIcon(severity: SeverityLevel): L.DivIcon {
  const colors: Record<SeverityLevel, { fill: string; size: number }> = {
    extreme:  { fill: "#DC2626", size: 18 },
    severe:   { fill: "#EA580C", size: 15 },
    civic:    { fill: "#CA8A04", size: 13 },
    resolved: { fill: "#16A34A", size: 11 },
  };
  const { fill, size } = colors[severity];
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:2.5px solid white;box-shadow:0 0 0 1.5px ${fill},0 2px 8px rgba(0,0,0,0.28);"></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Blue pulsing user-location dot */
const userIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
    <div class="radar-ping" style="position:absolute;width:20px;height:20px;border-radius:50%;background:#3B82F6;opacity:0.35;"></div>
    <div style="width:10px;height:10px;border-radius:50%;background:#2563EB;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);position:relative;z-index:2;"></div>
  </div>`,
  iconSize:   [20, 20],
  iconAnchor: [10, 10],
});

function formatTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  return `${Math.round(diff / 60)}h ago`;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100); }, [map]);
  return null;
}

interface Props {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function LiveMap({ incidents, selectedId, onSelect }: Props) {
  return (
    <MapContainer
      center={MAP_CENTER}
      zoom={12}
      style={{ height: "100%", width: "100%" }}
      zoomControl={true}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='© <a href="https://carto.com/">CARTO</a>'
      />

      {/* User location */}
      <Marker position={MAP_CENTER} icon={userIcon}>
        <Popup>
          <div className="text-xs font-semibold text-blue-700">📍 Your Location</div>
        </Popup>
      </Marker>

      {/* Incident markers */}
      {incidents.map((inc) => (
        <Marker
          key={inc.id}
          position={inc.coordinates}
          icon={makeIcon(inc.severity)}
          eventHandlers={{ click: () => onSelect(inc.id) }}
        >
          <Popup>
            <div style={{ minWidth: 200, fontFamily: "system-ui" }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: inc.severity === "extreme" ? "#FEE2E2" :
                            inc.severity === "severe"  ? "#FFEDD5" :
                            inc.severity === "civic"   ? "#FEF9C3" : "#DCFCE7",
                color: inc.severity === "extreme" ? "#991B1B" :
                       inc.severity === "severe"  ? "#9A3412" :
                       inc.severity === "civic"   ? "#713F12" : "#14532D",
                borderRadius: 999, padding: "2px 8px", fontSize: 10, fontWeight: 700,
                marginBottom: 6
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: "50%",
                  background: inc.severity === "extreme" ? "#DC2626" :
                              inc.severity === "severe"  ? "#EA580C" :
                              inc.severity === "civic"   ? "#CA8A04" : "#16A34A",
                  display: "inline-block"
                }} />
                {SEVERITY_CONFIG[inc.severity].label}
              </div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{inc.title}</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 6, lineHeight: 1.4 }}>{inc.aiSummary}</p>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9CA3AF" }}>
                <span>📍 {inc.location.split(",")[0]}</span>
                <span>{formatTime(inc.timestamp)}</span>
              </div>
              {inc.verified && (
                <div style={{ fontSize: 10, color: "#2563EB", marginTop: 4 }}>✓ AI Verified</div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      <MapResizer />
    </MapContainer>
  );
}
