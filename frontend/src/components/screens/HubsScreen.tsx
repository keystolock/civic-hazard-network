"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Share2, MapPin, Phone, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MOCK_HUBS } from "@/lib/mockData";
import type { RadiusOption } from "@/lib/types";

const HubMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

const RADII: RadiusOption[] = ["25km", "50km", "100km"];

export default function HubsScreen() {
  const [radius, setRadius] = useState<RadiusOption>("25km");

  const isEmpty = radius === "50km";
  const visibleHubs = radius === "100km" ? MOCK_HUBS : MOCK_HUBS.slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Map */}
      <div className="h-52 relative flex-shrink-0">
        <HubMap height={208} zoom={11} />
        {/* Legend pill */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur rounded-xl px-3 py-2 shadow-md border border-neutral-100 flex flex-col gap-1.5 text-[11px] font-medium text-neutral-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E12D4B]" /> Best match
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400" /> Unavailable
          </span>
        </div>
      </div>

      {/* Radius selector */}
      <div className="flex gap-2 px-4 py-3 flex-shrink-0 border-b border-neutral-100">
        {RADII.map((r) => {
          const active = radius === r;
          return (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`flex-1 py-2 rounded-full text-xs font-semibold border-2 transition-all ${
                active
                  ? "border-[#E12D4B] bg-rose-50 text-[#E12D4B] ring-2 ring-rose-100"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300"
              }`}
            >
              {r}
            </button>
          );
        })}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <AnimatePresence mode="wait">
          {isEmpty ? (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center justify-center h-full text-center py-10 gap-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <MapPin size={28} className="text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-800">No confirmed units within 50 km</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-[220px]">
                  Try a wider radius, or search responders near you directly.
                </p>
              </div>
            </motion.div>
          ) : (
            /* Hub list */
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Showing {visibleHubs.length} Center(s)
              </p>
              {visibleHubs.map((hub, i) => (
                <motion.div
                  key={hub.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#F7F7F8] rounded-2xl p-3.5 border border-neutral-200/60"
                >
                  {/* Name + distance */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-neutral-900 leading-tight flex-1">{hub.name}</p>
                    <span className="text-xs text-neutral-500 font-medium whitespace-nowrap">{hub.distance}</span>
                  </div>
                  {/* Pills */}
                  <div className="flex gap-1.5 flex-wrap mb-3">
                    {hub.tags.map((t) => (
                      <span key={t} className="bg-neutral-200/60 text-neutral-600 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                        {t}
                      </span>
                    ))}
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      {hub.units} units
                    </span>
                    <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                      {hub.compatible}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="bg-white border border-neutral-200 rounded-xl p-2.5 hover:bg-neutral-50 transition-colors">
                      <Share2 size={13} className="text-neutral-600" />
                    </button>
                    <button className="bg-white border border-neutral-200 rounded-xl p-2.5 hover:bg-neutral-50 transition-colors">
                      <MapPin size={13} className="text-neutral-600" />
                    </button>
                    <button className="flex-1 bg-white border border-neutral-200 rounded-xl py-2 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors">
                      <Phone size={12} />
                      Call
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky bottom footer when empty */}
      <AnimatePresence>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-4 border-t border-neutral-100 bg-white/90 backdrop-blur-sm flex-shrink-0"
          >
            <p className="text-xs text-center text-neutral-500 mb-2">Unable to travel to the hubs?</p>
            <button className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-[#E62E4D] to-[#F04461] shadow-lg shadow-rose-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Radio size={15} />
              Search Responders Near You
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
