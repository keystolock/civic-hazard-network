"use client";

import { Bell, Search, ShieldAlert } from "lucide-react";
import type { Screen } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/mockData";

const SCREEN_TITLES: Record<Screen, string> = {
  create:   "Send Request",
  sending:  "Broadcasting...",
  tracker:  "Live Acceptance Tracker",
  hubs:     "Nearby Response Hubs",
  whatsapp: "WhatsApp Alert Bot",
};

const SCREEN_SUBTITLES: Record<Screen, string> = {
  create:   "Broadcast an emergency alert to responders near you",
  sending:  "Notifying 14 responders in your area...",
  tracker:  "Track who has accepted your emergency request in real time",
  hubs:     "Locate and contact verified emergency resource centres",
  whatsapp: "Simulate the WhatsApp Business notification flow",
};

interface Props {
  activeScreen: Screen;
}

export default function DesktopTopBar({ activeScreen }: Props) {
  return (
    <header className="hidden lg:flex flex-shrink-0 items-center justify-between px-8 py-4 bg-white border-b border-neutral-200/80 gap-4">
      {/* Title section */}
      <div>
        <h1 className="text-lg font-bold text-neutral-900 tracking-tight">
          {SCREEN_TITLES[activeScreen]}
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">{SCREEN_SUBTITLES[activeScreen]}</p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-3 py-2 text-sm text-neutral-400 w-52">
          <Search size={14} />
          <span className="text-xs">Search responders, hubs...</span>
        </div>

        {/* Alert badge */}
        <button className="relative w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center hover:bg-neutral-200 transition-colors">
          <Bell size={16} className="text-neutral-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E12D4B] rounded-full" />
        </button>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 rounded-xl px-3 py-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-semibold text-emerald-700">System Live</span>
        </div>
      </div>
    </header>
  );
}
