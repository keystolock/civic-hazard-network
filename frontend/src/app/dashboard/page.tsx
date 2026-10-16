"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import FilterBar from "@/components/dashboard/FilterBar";
import IncidentCard from "@/components/dashboard/IncidentCard";
import { MOCK_INCIDENTS, DASHBOARD_STATS } from "@/lib/mockData";
import type { IncidentCategory, RadiusFilter } from "@/lib/types";
import { Radio, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import Link from "next/link";

// Dynamically import Leaflet map – no SSR
const LiveMap = dynamic(() => import("@/components/dashboard/LiveMap"), { ssr: false });

const TREND_ICON = {
  up:      <TrendingUp  size={12} className="text-emerald-500" />,
  down:    <TrendingDown size={12} className="text-emerald-500" />,
  neutral: <Minus        size={12} className="text-neutral-400" />,
};

export default function DashboardPage() {
  const [category, setCategory] = useState<IncidentCategory>("All");
  const [radius,   setRadius]   = useState<RadiusFilter>("5km");
  const [search,   setSearch]   = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return MOCK_INCIDENTS.filter((inc) => {
      if (category !== "All" && inc.category !== category) return false;
      if (search && !inc.title.toLowerCase().includes(search.toLowerCase()) &&
          !inc.location.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [category, search]);

  return (
    // Takes full viewport minus the 64px navbar
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Stats bar ─────────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-neutral-900 text-white px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-6 min-w-max">
          {DASHBOARD_STATS.map((s) => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-base font-bold ${s.color}`}>{s.value}</span>
              <div>
                <p className="text-[10px] text-neutral-400 leading-none">{s.label}</p>
                <div className="flex items-center gap-0.5 mt-0.5">
                  {TREND_ICON[s.trend]}
                  <span className="text-[9px] text-neutral-400">{s.delta}</span>
                </div>
              </div>
              <div className="w-px h-6 bg-neutral-700 ml-2" />
            </div>
          ))}
          <button className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors text-xs">
            <RefreshCw size={11} />
            Live
          </button>
        </div>
      </div>

      {/* ── Main split-screen ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left panel: Feed */}
        <div className="flex flex-col w-full md:w-[420px] xl:w-[460px] flex-shrink-0 border-r border-neutral-200/80 bg-neutral-50 overflow-hidden">
          {/* Filter bar */}
          <FilterBar
            category={category}
            radius={radius}
            search={search}
            onCategory={setCategory}
            onRadius={setRadius}
            onSearch={setSearch}
            count={filtered.length}
          />

          {/* Scrollable card feed */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-2">
                <p className="text-sm font-semibold text-neutral-600">No incidents found</p>
                <p className="text-xs text-neutral-400">Try adjusting your filters or radius</p>
              </div>
            ) : (
              filtered.map((inc, i) => (
                <IncidentCard
                  key={inc.id}
                  incident={inc}
                  selected={selectedId === inc.id}
                  onClick={() => setSelectedId(inc.id === selectedId ? null : inc.id)}
                  index={i}
                />
              ))
            )}
          </div>

          {/* SOS CTA at bottom of feed */}
          <div className="flex-shrink-0 p-3 border-t border-neutral-200 bg-white">
            <Link
              href="/report"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-gradient-to-r from-[#E12D4B] to-[#C01F3A] text-white text-sm font-semibold shadow-sm shadow-red-200 hover:shadow-red-300 active:scale-[0.98] transition-all"
            >
              <Radio size={15} />
              Report New Incident
            </Link>
          </div>
        </div>

        {/* Right panel: Map */}
        <div className="flex-1 relative overflow-hidden">
          {/* Map legend overlay */}
          <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur border border-neutral-200/80 rounded-xl px-3.5 py-3 shadow-md text-xs space-y-2">
            <p className="font-bold text-neutral-700 text-[11px] uppercase tracking-wide mb-1.5">Severity Legend</p>
            {(["extreme","severe","civic","resolved"] as const).map((s) => (
              <div key={s} className="flex items-center gap-2 font-medium text-neutral-600">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  s === "extreme" ? "bg-red-600" :
                  s === "severe"  ? "bg-orange-500" :
                  s === "civic"   ? "bg-yellow-500" : "bg-green-600"
                }`} />
                {s === "extreme" ? "Extreme / Disaster" :
                 s === "severe"  ? "Severe Hazard" :
                 s === "civic"   ? "Civic Complaint" : "Resolved"}
              </div>
            ))}
            <hr className="border-neutral-200 my-1" />
            <div className="flex items-center gap-2 font-medium text-blue-600">
              <span className="w-3 h-3 rounded-full bg-blue-600 flex-shrink-0" />
              Your Location
            </div>
          </div>

          {/* Incident count badge */}
          <div className="absolute top-3 right-3 z-[1000] bg-neutral-900/85 backdrop-blur text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow">
            {filtered.length} incidents on map
          </div>

          <LiveMap
            incidents={filtered}
            selectedId={selectedId}
            onSelect={(id) => setSelectedId(id === selectedId ? null : id)}
          />
        </div>
      </div>
    </div>
  );
}
