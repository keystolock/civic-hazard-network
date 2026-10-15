"use client";

import { Send, Radio, MapPin, MessageCircle, Bell, Settings, Activity, ShieldAlert } from "lucide-react";
import type { Screen } from "@/lib/types";
import { NAV_ITEMS, STATS, ACTIVITY_FEED } from "@/lib/mockData";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Send, Radio, MapPin, MessageCircle,
};

const ACTIVITY_COLORS: Record<string, string> = {
  accept:    "bg-emerald-100 text-emerald-600",
  alert:     "bg-rose-100 text-rose-600",
  done:      "bg-blue-100 text-blue-600",
  hub:       "bg-amber-100 text-amber-600",
  broadcast: "bg-purple-100 text-purple-600",
};

interface Props {
  activeScreen: Screen;
  onNavigate: (s: Screen) => void;
}

export default function DesktopSidebar({ activeScreen, onNavigate }: Props) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 bg-white border-r border-neutral-200/80 h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E12D4B] to-[#F04461] flex items-center justify-center shadow-sm flex-shrink-0">
          <ShieldAlert size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-neutral-900 leading-none">CivicAlert</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">Emergency Response Network</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1 border-b border-neutral-100">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-3 mb-2">Navigation</p>
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon];
          const active = activeScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "nav-active bg-rose-50 text-[#E12D4B]"
                  : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
              }`}
            >
              {Icon && <Icon size={16} className={active ? "text-[#E12D4B]" : "text-neutral-500"} />}
              {item.label}
              {item.id === "tracker" && (
                <span className="ml-auto bg-[#E12D4B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  3
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Stats grid */}
      <div className="px-4 py-4 border-b border-neutral-100">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-3">Live Overview</p>
        <div className="grid grid-cols-2 gap-2">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[#F7F7F8] rounded-xl p-3 border border-neutral-200/60">
              <p className={`text-lg font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-neutral-500 mt-1 font-medium">{s.label}</p>
              <p className="text-[9px] text-neutral-400 mt-0.5">{s.delta}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Activity Feed</p>
          <Activity size={12} className="text-neutral-400" />
        </div>
        <div className="space-y-2.5">
          {ACTIVITY_FEED.map((a) => (
            <div key={a.id} className="flex items-start gap-2.5">
              <span className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] ${ACTIVITY_COLORS[a.type]}`}>
                {a.type === "accept" ? "✓" : a.type === "alert" ? "!" : a.type === "done" ? "★" : a.type === "hub" ? "H" : "↗"}
              </span>
              <div className="min-w-0">
                <p className="text-xs text-neutral-700 leading-snug">{a.text}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom profile strip */}
      <div className="px-4 py-3.5 border-t border-neutral-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          RK
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-800 truncate">Rahul Kumar</p>
          <p className="text-[10px] text-emerald-600 font-medium">● Online</p>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <Bell size={15} />
        </button>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors">
          <Settings size={15} />
        </button>
      </div>
    </aside>
  );
}
