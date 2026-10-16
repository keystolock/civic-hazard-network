"use client";

import { CheckCircle, Clock, GitMerge, Cpu, MapPin, ChevronRight, Share2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import SeverityBadge from "@/components/shared/SeverityBadge";
import type { Incident } from "@/lib/types";
import { SEVERITY_CONFIG, CATEGORY_CONFIG } from "@/lib/mockData";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

const STATUS_STYLE: Record<string, string> = {
  "Open":        "bg-red-50 text-red-700 border-red-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Resolved":    "bg-green-50 text-green-700 border-green-200",
};

interface Props {
  incident: Incident;
  selected: boolean;
  onClick: () => void;
  index: number;
}

export default function IncidentCard({ incident: inc, selected, onClick, index }: Props) {
  const cfg = SEVERITY_CONFIG[inc.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border transition-all duration-150 overflow-hidden group ${
        selected
          ? `border-2 ${cfg.border} shadow-md`
          : "border-neutral-200/70 hover:border-neutral-300 hover:shadow-sm bg-white"
      }`}
    >
      {/* Severity accent bar */}
      <div className={`h-1 ${cfg.bg}`} />

      <div className="p-4">
        {/* Top row: badges */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap gap-1.5">
            <SeverityBadge severity={inc.severity} size="sm" />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[inc.status]}`}>
              {inc.status}
            </span>
            {inc.verified && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Cpu size={8} /> AI Verified
              </span>
            )}
          </div>
          <span className="text-[10px] text-neutral-400 font-medium whitespace-nowrap flex-shrink-0">
            {timeAgo(inc.timestamp)}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-neutral-900 leading-snug mb-1 group-hover:text-[#E12D4B] transition-colors line-clamp-2">
          {inc.title}
        </h3>

        {/* AI Summary */}
        <p className="text-xs text-neutral-500 leading-relaxed mb-3 line-clamp-2">
          {inc.aiSummary}
        </p>

        {/* Location & category */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
          <MapPin size={11} className="text-neutral-400 flex-shrink-0" />
          <span className="truncate">{inc.location}</span>
          <span className="flex-shrink-0 text-neutral-300">•</span>
          <span className="flex-shrink-0 font-medium text-neutral-600">{inc.category}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-neutral-500">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {inc.upvotes}
          </span>
          {inc.reportCount > 1 && (
            <span className="flex items-center gap-1 text-purple-600">
              <GitMerge size={11} />
              {inc.reportCount} merged
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {inc.reporter}
          </span>
          <button
            onClick={(e) => e.stopPropagation()}
            className="ml-auto text-neutral-400 hover:text-[#E12D4B] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
