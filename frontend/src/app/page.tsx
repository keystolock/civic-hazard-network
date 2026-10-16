"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldAlert, MapPin, Cpu, Bell, Radio, ArrowRight,
  TrendingUp, Users, CheckCircle, AlertTriangle, Zap, GitMerge,
  Map, Navigation, ShieldCheck,
} from "lucide-react";
import { DASHBOARD_STATS, FEATURES, HOW_IT_WORKS, MOCK_INCIDENTS } from "@/lib/mockData";
import SeverityBadge from "@/components/shared/SeverityBadge";

const FEATURE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Cpu, GitMerge, Map, Zap, Navigation, ShieldCheck,
};

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MapPin, Cpu, Bell,
};

// Pull 3 most recent extreme/severe incidents for preview
const PREVIEW_INCIDENTS = MOCK_INCIDENTS
  .filter((i) => i.severity === "extreme" || i.severity === "severe")
  .slice(0, 3);

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  if (diff < 60) return `${Math.round(diff)}m ago`;
  return `${Math.round(diff / 60)}h ago`;
}

export default function HomePage() {
  return (
    <div className="bg-white">

      {/* ════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-[#1c0609] text-white">
        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        {/* Crimson radial glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E12D4B]/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 text-xs font-semibold bg-white/8 border border-white/15 px-3 py-1.5 rounded-full text-red-300 mb-6">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                  Live Platform — AI-Powered Hazard Network
                </span>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.12] mb-5">
                  Crowdsourced<br />
                  <span className="text-[#E12D4B]">Civic Hazard</span><br />
                  Reporting &amp; Disaster<br />Alert System
                </h1>
                <p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-lg">
                  Citizens report road problems (potholes, garbage) and emergency hazards (floods, landslides) with automated GPS, photo uploads, AI verification, and instant multi-channel emergency alerts.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/report"
                    className="flex items-center gap-2 px-6 py-3 bg-[#E12D4B] hover:bg-[#C01F3A] text-white font-semibold rounded-xl shadow-lg shadow-red-900/40 active:scale-95 transition-all"
                  >
                    <Radio size={16} /> Report Incident
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/18 transition-all"
                  >
                    <Map size={16} /> View Live Map
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Right: Live feed preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm">
                {/* Mini header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs font-semibold text-white/80">Live Incident Feed</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-medium">{MOCK_INCIDENTS.length} active reports</span>
                </div>
                {/* Incident preview cards */}
                <div className="p-3 space-y-2">
                  {PREVIEW_INCIDENTS.map((inc, i) => (
                    <motion.div
                      key={inc.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.12 }}
                      className="bg-white/5 border border-white/10 rounded-xl p-3.5"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <SeverityBadge severity={inc.severity} size="sm" />
                        <span className="text-[10px] text-white/40">{timeAgo(inc.timestamp)}</span>
                      </div>
                      <p className="text-white/90 text-xs font-semibold leading-snug mb-1">{inc.title}</p>
                      <p className="text-white/50 text-[11px] leading-relaxed line-clamp-2">{inc.aiSummary}</p>
                      {inc.verified && (
                        <p className="text-blue-400 text-[10px] font-semibold mt-1.5 flex items-center gap-1">
                          <Cpu size={9} /> AI Verified
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
                <div className="px-4 py-3 border-t border-white/10">
                  <Link href="/dashboard" className="text-xs text-[#E12D4B] font-semibold hover:underline flex items-center gap-1">
                    Open full dashboard <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-16 pt-8 border-t border-white/10">
            {DASHBOARD_STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="text-center"
              >
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-neutral-500 text-[11px] font-medium mt-0.5">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          SEVERITY LEGEND
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-950 text-white py-8 px-4 border-y border-neutral-800">
        <div className="max-w-screen-xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Sign Convention:</span>
            {[
              { color: "bg-red-500",    label: "Red",    desc: "Extreme Emergency / Natural Disaster (Landslide, Flood)" },
              { color: "bg-orange-500", label: "Orange", desc: "Severe Hazard (Major road cave-in, open high-voltage wire)" },
              { color: "bg-yellow-400", label: "Yellow", desc: "Civic Complaint (Pothole, garbage pile, broken streetlight)" },
              { color: "bg-green-500",  label: "Green",  desc: "Resolved / Fixed" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 text-sm">
                <span className={`w-3.5 h-3.5 rounded-full ${s.color} flex-shrink-0`} />
                <span className="font-bold text-neutral-300">{s.label}:</span>
                <span className="text-neutral-500 text-xs">{s.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-[#E12D4B] uppercase tracking-widest">Simple &amp; Fast</span>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-2 mb-3">How It Works</h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">From citizen tap to authority action in under 60 seconds.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden sm:block absolute top-12 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 bg-neutral-200" />
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = STEP_ICONS[step.icon] || MapPin;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center relative"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#E12D4B] to-[#9B1D30] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-red-100 relative z-10">
                    <Icon size={26} className="text-white" />
                  </div>
                  <div className="absolute top-7 left-1/2 -translate-x-1/2 w-7 h-7 bg-white border-2 border-neutral-200 rounded-full flex items-center justify-center text-xs font-bold text-neutral-600 z-20">
                    {step.number}
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2 mt-2">{step.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FEATURES GRID
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-neutral-50 py-20 px-4">
        <div className="max-w-screen-lg mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-[#E12D4B] uppercase tracking-widest">Enterprise-Grade</span>
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight mt-2 mb-3">Platform Features</h2>
            <p className="text-neutral-500 text-sm max-w-xl mx-auto">Not just a complaint form — a complete civic intelligence system.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => {
              const Icon = FEATURE_ICONS[f.icon] || CheckCircle;
              return (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-white border border-neutral-200 rounded-2xl p-6 hover:shadow-lg hover:border-neutral-300 transition-all group"
                >
                  <div className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${f.color} group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="text-sm font-bold text-neutral-900 mb-2">{f.title}</h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{f.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          CTA BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-[#E12D4B] to-[#9B1D30] text-white py-16 px-4">
        <div className="max-w-screen-lg mx-auto text-center">
          <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4">See a hazard? Report it now.</h2>
          <p className="text-red-200 text-sm mb-8 max-w-md mx-auto">
            Every verified report helps authorities respond faster. AI handles deduplication and verification automatically.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/report"
              className="px-8 py-3.5 bg-white text-[#E12D4B] font-bold rounded-xl hover:bg-red-50 shadow-xl active:scale-95 transition-all"
            >
              🚨 Submit a Report
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all"
            >
              View Dashboard
            </Link>
            <Link
              href="/alerts"
              className="px-8 py-3.5 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-all"
            >
              Active Alerts
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════ */}
      <footer className="bg-neutral-950 text-neutral-500 py-12 px-4">
        <div className="max-w-screen-xl mx-auto">
          <div className="grid sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E12D4B] to-[#C01F3A] flex items-center justify-center">
                  <ShieldAlert size={15} className="text-white" />
                </div>
                <span className="text-white font-bold text-sm">CivicAlert</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs">
                Crowdsourced Civic Hazard Reporting &amp; Real-Time Disaster Alert System with AI Verification. Open-source academic project.
              </p>
            </div>
            {/* Links */}
            <div>
              <p className="text-neutral-300 text-xs font-bold uppercase tracking-wider mb-3">Platform</p>
              <ul className="space-y-2">
                {[
                  { label: "Dashboard",        href: "/dashboard" },
                  { label: "Active Alerts",    href: "/alerts"    },
                  { label: "Report Incident",  href: "/report"    },
                  { label: "About / Docs",     href: "/about"     },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-xs hover:text-white transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-neutral-300 text-xs font-bold uppercase tracking-wider mb-3">Tech Stack</p>
              <ul className="space-y-2 text-xs">
                {["Next.js / React", "Tailwind CSS", "Leaflet.js + OSM", "Gemini API (AI)", "FastAPI (Backend)", "Supabase (DB)"].map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs">© 2026 CivicAlert — Crowdsourced Hazard Reporting System. Academic / Open-Source Project.</p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-600 font-semibold">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
