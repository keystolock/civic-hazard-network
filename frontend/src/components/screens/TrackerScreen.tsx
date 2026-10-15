"use client";

import dynamic from "next/dynamic";
import { Phone, Share2, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { MOCK_RESPONDERS } from "@/lib/mockData";

// SSR-safe map
const MiniMap = dynamic(() => import("@/components/MiniMap"), { ssr: false });

const WA_ICON = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function TrackerScreen() {
  return (
    <div className="flex flex-col h-full">
      {/* Mini map */}
      <div className="h-32 relative flex-shrink-0">
        <MiniMap height={128} zoom={13} showToast toastText="Sneha Singh accepted your request" />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
        <div>
          <p className="text-base font-bold text-neutral-900">Responders who&apos;ve accepted</p>
          <p className="text-xs text-neutral-500 mt-0.5">Verified &amp; compatible nearby units</p>
        </div>
        <span className="bg-neutral-100 text-neutral-700 text-xs font-bold px-3 py-1 rounded-full">
          3/3
        </span>
      </div>

      {/* Responder cards */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {MOCK_RESPONDERS.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12 }}
            className="bg-[#F7F7F8] p-3.5 rounded-2xl border border-neutral-200/60"
          >
            {/* Top row */}
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: r.avatarColor }}
                >
                  {r.avatarInitials}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 rounded-full p-0.5 border-2 border-white">
                  <CheckCircle size={8} className="text-white" />
                </div>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-neutral-900 truncate">{r.name}</span>
                  <span className="bg-rose-50 text-[#E12D4B] border border-rose-200/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {r.badge}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {r.distance} • {r.meta}
                </p>
              </div>
            </div>

            {/* Action bar */}
            <div className="flex gap-2">
              <button className="bg-white border border-neutral-200 rounded-xl p-2.5 hover:bg-neutral-50 transition-colors flex-shrink-0">
                <Share2 size={14} className="text-neutral-600" />
              </button>
              <button className="flex-1 bg-white border border-neutral-200 rounded-xl py-2 text-xs font-semibold text-neutral-800 flex items-center justify-center gap-1.5 hover:bg-neutral-50 transition-colors">
                <Phone size={12} />
                Call
              </button>
              <button className="flex-1 bg-[#1FD061] hover:bg-[#19B855] text-white rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
                {WA_ICON}
                WhatsApp
              </button>
            </div>
          </motion.div>
        ))}

        {/* Waiting indicator */}
        <div className="flex items-center justify-center gap-2 py-5">
          <span className="w-2 h-2 rounded-full bg-[#E12D4B] pulse-dot-1 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#E12D4B] pulse-dot-2 inline-block" />
          <span className="w-2 h-2 rounded-full bg-[#E12D4B] pulse-dot-3 inline-block" />
          <span className="text-xs text-neutral-500 font-medium ml-1">
            Waiting for more, please be patient
          </span>
        </div>
      </div>
    </div>
  );
}
