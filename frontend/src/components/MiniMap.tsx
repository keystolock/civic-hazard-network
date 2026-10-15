"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import { MAP_CENTER } from "@/lib/mockData";

// Fix default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/** Custom crimson pin marker */
const crimsonIcon = L.divIcon({
  className: "",
  html: `
    <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
      <div class="radar-ping" style="position:absolute;width:22px;height:22px;border-radius:50%;background:#E12D4B;opacity:0.35;"></div>
      <div style="width:12px;height:12px;border-radius:50%;background:#E12D4B;border:2px solid white;box-shadow:0 0 0 1px #E12D4B;position:relative;z-index:10;"></div>
    </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

/** Force map to resize when container dimensions change */
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 80);
  }, [map]);
  return null;
}

interface MiniMapProps {
  height: number;
  zoom?: number;
  showToast?: boolean;
  toastText?: string;
}

export default function MiniMap({ height, zoom = 13, showToast, toastText }: MiniMapProps) {
  return (
    <div style={{ height }} className="w-full relative overflow-hidden">
      <MapContainer
        center={MAP_CENTER}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        doubleClickZoom={false}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <Marker position={MAP_CENTER} icon={crimsonIcon} />
        <MapResizer />
      </MapContainer>

      {/* Floating toast pill */}
      {showToast && toastText && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur shadow-md rounded-full px-4 py-1.5 text-xs font-semibold text-neutral-800 border border-neutral-100 whitespace-nowrap">
          📍 {toastText}
        </div>
      )}
    </div>
  );
}
