"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MAP_CENTER, SEVERITY_CONFIG } from "@/lib/mockData";
import type { Incident, SeverityLevel } from "@/lib/types";
import { formatTimeAgo } from "@/components/shared/TimeAgo";

/** Colored circle marker per severity */
function makeIcon(severity: SeverityLevel): L.DivIcon {
  const colors: Record<SeverityLevel, { fill: string; size: number }> = {
    extreme:  { fill: "#DC2626", size: 18 },
    severe:   { fill: "#EA580C", size: 15 },
    civic:    { fill: "#CA8A04", size: 13 },
    resolved: { fill: "#16A34A", size: 11 },
  };
  const { fill, size } = colors[severity] || colors.civic;
  return L.divIcon({
    className: "civic-marker-icon",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${fill};border:2.5px solid white;box-shadow:0 0 0 1.5px ${fill},0 2px 8px rgba(0,0,0,0.35);"></div>`,
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** Blue pulsing user-location dot */
function makeUserIcon(): L.DivIcon {
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">
      <div class="radar-ping" style="position:absolute;width:22px;height:22px;border-radius:50%;background:#3B82F6;opacity:0.4;"></div>
      <div style="width:11px;height:11px;border-radius:50%;background:#2563EB;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);position:relative;z-index:2;"></div>
    </div>`,
    iconSize:   [22, 22],
    iconAnchor: [11, 11],
  });
}

function createIncidentPopupHtml(inc: Incident): string {
  const cfg = SEVERITY_CONFIG[inc.severity] || { label: inc.severity };
  const badgeBg =
    inc.severity === "extreme" ? "#FEE2E2" :
    inc.severity === "severe"  ? "#FFEDD5" :
    inc.severity === "civic"   ? "#FEF9C3" : "#DCFCE7";
  const badgeText =
    inc.severity === "extreme" ? "#991B1B" :
    inc.severity === "severe"  ? "#9A3412" :
    inc.severity === "civic"   ? "#713F12" : "#14532D";
  const dotBg =
    inc.severity === "extreme" ? "#DC2626" :
    inc.severity === "severe"  ? "#EA580C" :
    inc.severity === "civic"   ? "#CA8A04" : "#16A34A";
  const timeStr = formatTimeAgo(inc.timestamp);
  const locName = inc.location.split(",")[0];
  const verifiedBadge = inc.verified
    ? `<div style="font-size:10px;color:#2563EB;font-weight:600;margin-top:4px;">✓ AI Verified</div>`
    : "";

  return `
    <div style="min-width: 210px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="display:inline-flex;align-items:center;gap:6px;background:${badgeBg};color:${badgeText};border-radius:999px;padding:2px 8px;font-size:10px;font-weight:700;margin-bottom:6px;">
        <span style="width:6px;height:6px;border-radius:50%;background:${dotBg};display:inline-block;"></span>
        ${cfg.label || inc.severity}
      </div>
      <p style="font-weight:700;font-size:13px;margin:0 0 4px 0;line-height:1.3;color:#111827;">
        ${inc.title}
      </p>
      <p style="font-size:11px;color:#4B5563;margin:0 0 6px 0;line-height:1.4;">
        ${inc.aiSummary}
      </p>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#6B7280;">
        <span>📍 ${locName}</span>
        <span>${timeStr}</span>
      </div>
      ${verifiedBadge}
    </div>
  `;
}

interface Props {
  incidents: Incident[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function LiveMap({ incidents, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Initialize vanilla Leaflet map on mount with complete React Strict Mode cleanup safety
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const markers = markerMapRef.current;

    // Create native Leaflet map instance
    const map = L.map(container, {
      center: MAP_CENTER,
      zoom: 12,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;

    // Free OpenStreetMap tile server with zero API keys or watermarks
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // User location marker
    const userMarker = L.marker(MAP_CENTER, { icon: makeUserIcon() }).addTo(map);
    userMarker.bindPopup('<div style="font-size:12px;font-weight:700;color:#1D4ED8;padding:4px 0;">📍 Your Current Position</div>');

    // Layer group for dynamic incident markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Invalidate size once DOM stabilizes
    const resizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      clearTimeout(resizeTimer);
      markersLayer.clearLayers();
      markers.clear();
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Sync incident markers whenever incidents change
  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    incidents.forEach((inc) => {
      const marker = L.marker(inc.coordinates, {
        icon: makeIcon(inc.severity),
      });

      marker.bindPopup(createIncidentPopupHtml(inc), {
        maxWidth: 260,
      });

      marker.on("click", () => {
        onSelectRef.current(inc.id);
      });

      marker.addTo(layer);
      markerMapRef.current.set(inc.id, marker);
    });
  }, [incidents]);

  // Handle flyTo and popup opening when selectedId changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const selectedInc = incidents.find((i) => i.id === selectedId);
    if (selectedInc) {
      map.flyTo(selectedInc.coordinates, 14, { duration: 1.0 });
      const marker = markerMapRef.current.get(selectedId);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedId, incidents]);

  return (
    <div
      ref={containerRef}
      id="civic-live-map-container"
      className="w-full h-full relative"
      style={{ minHeight: "100%" }}
    />
  );
}
