"use client";

import { Send, Radio, MapPin, MessageCircle } from "lucide-react";
import type { Screen } from "@/lib/types";
import { NAV_ITEMS } from "@/lib/mockData";

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Send, Radio, MapPin, MessageCircle,
};

interface Props {
  active: Screen;
  onNavigate: (s: Screen) => void;
}

export default function MobileBottomNav({ active, onNavigate }: Props) {
  return (
    <nav className="flex-shrink-0 lg:hidden bg-white border-t border-neutral-200/80 flex items-stretch">
      {NAV_ITEMS.map((item) => {
        const Icon = ICON_MAP[item.icon];
        const isActive = active === item.id || (active === "sending" && item.id === "create");
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors relative ${
              isActive ? "text-[#E12D4B]" : "text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {isActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#E12D4B] rounded-full" />
            )}
            {Icon && <Icon size={19} />}
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
