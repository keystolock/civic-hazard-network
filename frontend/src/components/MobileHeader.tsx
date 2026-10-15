"use client";

import { ArrowLeft, X } from "lucide-react";
import type { Screen } from "@/lib/types";

const SCREEN_TITLES: Record<Screen, string> = {
  create:   "Send request",
  sending:  "Sending...",
  tracker:  "Request sent",
  hubs:     "Nearby Hubs",
  whatsapp: "Alert Bot",
};

interface Props {
  screen: Screen;
  onBack?: () => void;
  onClose?: () => void;
}

export default function MobileHeader({ screen, onBack, onClose }: Props) {
  // Hide header on sending screen (full bleed animation)
  if (screen === "sending") return null;

  return (
    <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-neutral-100 flex-shrink-0 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} className="text-neutral-700" />
        </button>
        <span className="text-base font-semibold text-neutral-900">
          {SCREEN_TITLES[screen]}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button className="border border-neutral-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors">
          EN
        </button>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
          aria-label="Close"
        >
          <X size={16} className="text-neutral-700" />
        </button>
      </div>
    </header>
  );
}
