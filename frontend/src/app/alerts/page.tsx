"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Radio, Filter, X } from "lucide-react";
import SeverityBadge from "@/components/shared/SeverityBadge";
import { MOCK_ALERTS, MOCK_INCIDENTS } from "@/lib/mockData";
import type { SeverityLevel } from "@/lib/types";

const FILTER_TABS: { label: string; value: SeverityLevel | "all" }[] = [
  { label: "All",       value: "all"      },
  { label: "🔴 Extreme", value: "extreme"  },
  { label: "🟠 Severe",  value: "severe"   },
  { label: "🟡 Civic",   value: "civic"    },
  { label: "✅ Resolved", value: "resolved" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  if (diff < 1440) return `${Math.round(diff / 60)}h ago`;
  return `${Math.round(diff / 1440)}d ago`;
}

const SOURCE_STYLE: Record<string, string> = {
  Authority: "bg-blue-50 text-blue-700 border-blue-200",
  System:    "bg-purple-50 text-purple-700 border-purple-200",
  Citizen:   "bg-amber-50 text-amber-700 border-amber-200",
};

const SEVERITY_BORDER: Record<SeverityLevel, string> = {
  extreme:  "border-l-red-500",
  severe:   "border-l-orange-500",
  civic:    "border-l-yellow-500",
  resolved: "border-l-green-500",
};

const SEVERITY_BG: Record<SeverityLevel, string> = {
  extreme:  "bg-red-50",
  severe:   "bg-orange-50",
  civic:    "bg-yellow-50",
  resolved: "bg-green-50",
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<SeverityLevel | "all">("all");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const filteredAlerts = useMemo(() => {
    return MOCK_ALERTS.filter((a) => {
      if (filter !== "all" && a.severity !== filter) return false;
      if (showActiveOnly && !a.active) return false;
      return true;
    });
  }, [filter, showActiveOnly]);

  // Recent extreme incidents for the incident ticker
  const extremeIncidents = MOCK_INCIDENTS.filter((i) => i.severity === "extreme").slice(0, 4);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50">

      {/* ── Emergency ticker strip ──────────────────────────────────── */}
      <div className="bg-[#E12D4B] text-white py-2 px-4 overflow-hidden">
        <div className="flex items-center gap-3 max-w-screen-2xl mx-auto">
          <span className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
            <AlertTriangle size={11} /> LIVE ALERTS
          </span>
          <div className="flex items-center gap-8 overflow-x-auto scrollbar-none text-xs font-medium text-red-100">
            {extremeIncidents.map((inc) => (
              <span key={inc.id} className="flex-shrink-0">
                📍 {inc.location.split(",")[0]} — {inc.aiSummary.substring(0, 60)}...
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Active Alerts</h1>
            <p className="text-neutral-500 text-sm mt-1">
              Real-time emergency broadcasts and authority notifications — {filteredAlerts.length} showing
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowActiveOnly((v) => !v)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                showActiveOnly
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
              }`}
            >
              <Radio size={12} /> Active Only
            </button>
          </div>
        </div>

        {/* ── Stats summary ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Active Alerts",   value: MOCK_ALERTS.filter((a) => a.active).length,             color: "text-red-600",    bg: "bg-red-50 border-red-100"    },
            { label: "Extreme",         value: MOCK_ALERTS.filter((a) => a.severity === "extreme").length, color: "text-red-700", bg: "bg-red-50 border-red-100"   },
            { label: "Severe",          value: MOCK_ALERTS.filter((a) => a.severity === "severe").length,  color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
            { label: "Resolved Today",  value: MOCK_ALERTS.filter((a) => !a.active).length,             color: "text-green-600",  bg: "bg-green-50 border-green-100" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-xl p-4`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filter tabs ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-6">
          {FILTER_TABS.map((tab) => {
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                  active
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Alert cards ──────────────────────────────────────────── */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-16 text-neutral-400">
                <Filter size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">No alerts match your filter</p>
              </div>
            ) : (
              filteredAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-xl border border-l-4 shadow-sm hover:shadow-md transition-shadow overflow-hidden ${SEVERITY_BORDER[alert.severity]}`}
                >
                  <div className={`${SEVERITY_BG[alert.severity]} px-4 py-3 flex items-start justify-between gap-3`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <SeverityBadge severity={alert.severity} size="sm" />
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SOURCE_STYLE[alert.source]}`}>
                          {alert.source}
                        </span>
                        {!alert.active && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200">
                            Inactive
                          </span>
                        )}
                        {alert.active && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-neutral-900 leading-snug">{alert.title}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium flex-shrink-0">
                      <Clock size={10} /> {timeAgo(alert.timestamp)}
                    </span>
                  </div>

                  <div className="px-4 py-3.5">
                    <p className="text-sm text-neutral-700 leading-relaxed mb-3">{alert.message}</p>
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        📍 Affected: <strong className="text-neutral-700">{alert.affectedArea}</strong>
                      </span>
                      <div className="flex gap-2">
                        <button className="text-xs font-semibold text-[#E12D4B] hover:underline">
                          View on Map →
                        </button>
                        {alert.active && (
                          <button className="text-xs font-semibold text-neutral-500 hover:text-neutral-800 transition-colors">
                            Share Alert
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
