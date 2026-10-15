"use client";

import { MapPin, Clock, Users, Zap, ChevronRight } from "lucide-react";
import type { Screen } from "@/lib/types";
import { MOCK_RESPONDERS, MOCK_HUBS } from "@/lib/mockData";
import dynamic from "next/dynamic";

const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

interface Props {
  activeScreen: Screen;
}

export default function DesktopRightPanel({ activeScreen }: Props) {
  return (
    <aside className="hidden xl:flex flex-col w-72 bg-white border-l border-neutral-200/80 h-full flex-shrink-0 overflow-y-auto">
      {/* Map preview */}
      <div className="flex-shrink-0">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Live Map</p>
          <button className="text-[11px] text-[#E12D4B] font-semibold hover:underline flex items-center gap-0.5">
            Expand <ChevronRight size={11} />
          </button>
        </div>
        <MiniMap height={140} zoom={12} />
      </div>

      {/* Quick responder list */}
      <div className="px-5 py-4 border-t border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Nearby Responders</p>
          <span className="bg-rose-50 text-[#E12D4B] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {MOCK_RESPONDERS.length} active
          </span>
        </div>
        <div className="space-y-2.5">
          {MOCK_RESPONDERS.map((r) => (
            <div key={r.id} className="flex items-center gap-2.5 p-2.5 bg-[#F7F7F8] rounded-xl border border-neutral-200/60 hover:border-neutral-300 transition-colors cursor-pointer">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: r.avatarColor }}
              >
                {r.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-neutral-800 truncate">{r.name}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">{r.distance}</p>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-200/60 flex-shrink-0">
                {r.badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-5 py-4 border-t border-neutral-100 space-y-3">
        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Quick Info</p>

        <div className="flex items-center gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
          <Zap size={16} className="text-[#E12D4B] flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-neutral-800">Alert Active</p>
            <p className="text-[10px] text-neutral-500">Broadcast sent 2m ago</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#F7F7F8] rounded-xl border border-neutral-200/60">
          <Users size={16} className="text-neutral-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-neutral-800">14 Notified</p>
            <p className="text-[10px] text-neutral-500">3 accepted so far</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#F7F7F8] rounded-xl border border-neutral-200/60">
          <Clock size={16} className="text-neutral-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-neutral-800">Avg. 4 min response</p>
            <p className="text-[10px] text-neutral-500">Faster than area avg.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-[#F7F7F8] rounded-xl border border-neutral-200/60">
          <MapPin size={16} className="text-neutral-500 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-neutral-800">3 Hubs within 30 km</p>
            <p className="text-[10px] text-neutral-500">Apollo, Red Cross, Civil</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 border-t border-neutral-100">
        <p className="text-[10px] text-neutral-400 text-center">
          CivicAlert v2.0 · All data mock/demo
        </p>
      </div>
    </aside>
  );
}
