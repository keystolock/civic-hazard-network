import Link from "next/link";
import { TECH_STACK, HOW_IT_WORKS, FEATURES } from "@/lib/mockData";
import { CheckCircle, MapPin, Bell, Cpu, ExternalLink, Users } from "lucide-react";

const ICON_MAP: Record<string, string> = {
  MapPin: "📍", Cpu: "🤖", Bell: "🔔",
};

const FUTURE_ASPECTS = [
  { title: "Authority Admin Dashboard", desc: "Dedicated role-based login for municipal officers or disaster response teams to update ticket statuses (Mark as In Progress or Resolved)." },
  { title: "Automated Evacuation Route Suggester", desc: "Using Dijkstra's or A* routing algorithms on OpenStreetMap to highlight alternative safe routes around reported road blockages or flooded zones." },
  { title: "Offline SMS Fallback Reporting", desc: "Allowing citizens with zero internet to report emergencies by texting a formatted keyword with GPS coordinates or landmarks to an inbound webhook." },
  { title: "Community Trust Scoring", desc: "Rewarding active citizens with reputation points for accurate reports, while silently penalizing or rate-limiting users who submit repeated false alerts." },
];

export default function AboutPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50">

      {/* ── Hero banner ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1a0a10] text-white py-16 px-4">
        <div className="max-w-screen-lg mx-auto text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold bg-white/10 border border-white/20 px-3 py-1.5 rounded-full text-red-300 mb-6">
            🎓 Academic / Open-Source Project
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 leading-tight">
            Crowdsourced Civic Hazard Reporting<br className="hidden sm:block" />
            &amp; Real-Time Disaster Alert System
          </h1>
          <p className="text-lg font-semibold text-red-400 mb-4">with AI Verification</p>
          <p className="text-neutral-400 text-sm max-w-2xl mx-auto leading-relaxed">
            A live platform where citizens report both daily road problems (potholes, garbage) and emergency hazards (floods, landslides) with automated GPS location, photo uploads, AI-powered deduplication, and instant multi-channel alerts.
          </p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <Link href="/dashboard" className="px-5 py-2.5 bg-[#E12D4B] text-white text-sm font-semibold rounded-xl hover:bg-[#C01F3A] transition-colors shadow-lg shadow-red-900/30">
              View Dashboard
            </Link>
            <Link href="/report" className="px-5 py-2.5 bg-white/10 border border-white/20 text-white text-sm font-semibold rounded-xl hover:bg-white/20 transition-colors">
              Submit a Report
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">

        {/* ── How It Works ──────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">How It Works</h2>
          <p className="text-neutral-500 text-sm mb-8">Three steps from citizen report to authority action.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.number} className="bg-white border border-neutral-200 rounded-2xl p-6 relative">
                <div className="w-10 h-10 bg-gradient-to-br from-[#E12D4B] to-[#C01F3A] rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step.number}
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Sign Convention ───────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Severity Sign Convention</h2>
          <p className="text-neutral-500 text-sm mb-6">Color-coded severity levels used across the map, cards, and alerts.</p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { color: "bg-red-500",    border: "border-red-200",    bg: "bg-red-50",    label: "🔴 Red — Extreme Emergency",       example: "Natural Disaster (Landslide, Flood)",      text: "text-red-800"    },
              { color: "bg-orange-500", border: "border-orange-200", bg: "bg-orange-50", label: "🟠 Orange — Severe Hazard",        example: "Major road cave-in, open high-voltage wire", text: "text-orange-800" },
              { color: "bg-yellow-400", border: "border-yellow-200", bg: "bg-yellow-50", label: "🟡 Yellow — Civic Complaint",      example: "Pothole, garbage pile, broken streetlight", text: "text-yellow-800" },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`w-5 h-5 rounded-full ${s.color} flex-shrink-0`} />
                  <p className={`text-sm font-bold ${s.text}`}>{s.label}</p>
                </div>
                <p className={`text-xs ${s.text} opacity-80`}>{s.example}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-3">
            <span className="w-5 h-5 rounded-full bg-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-green-800">🟢 Green — Resolved</p>
              <p className="text-xs text-green-700 mt-0.5">Issue fixed and verified by authority or AI — ticket closed.</p>
            </div>
          </div>
        </section>

        {/* ── Platform Features ─────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Platform Features</h2>
          <p className="text-neutral-500 text-sm mb-8">What makes CivicAlert different from a basic complaint form.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-3 ${f.color}`}>
                  <CheckCircle size={18} />
                </div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1.5">{f.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Technology Stack</h2>
          <p className="text-neutral-500 text-sm mb-6">Fully open-source stack with minimal cost.</p>
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">Layer / Feature</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">Technology Used</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wide hidden sm:table-cell">Usage</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {TECH_STACK.map((row, i) => (
                    <tr key={i} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-neutral-800 text-xs">{row.layer}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="bg-neutral-100 text-neutral-700 font-medium px-2.5 py-1 rounded-lg">{row.tech}</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-neutral-500 hidden sm:table-cell max-w-xs">{row.usage}</td>
                      <td className="px-5 py-3.5 text-xs">
                        <span className="bg-green-50 text-green-700 border border-green-200 font-semibold px-2 py-0.5 rounded-full">{row.cost}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Website Layout Spec ───────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Website Architecture</h2>
          <p className="text-neutral-500 text-sm mb-6">Key design and interaction principles.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Layout Structure",     desc: "A split-screen responsive dashboard. The left side holds a real-time, scrollable card feed of verified reports; the right side features a full-screen Leaflet.js map." },
              { title: "Live Map Interaction",  desc: "Incidents render as color-coded pins: Red for high-risk disasters, Orange for severe road hazards, Yellow for civic complaints, and Green for resolved tickets. Clicking any pin opens a detail card." },
              { title: "Filter Bar",            desc: "Top toolbar allows instant filtering by radius (1 km, 5 km, city-wide) and category tabs (All, Disasters, Roads, Utilities)." },
              { title: "SOS / Report Modal",    desc: "A quick 3-step form with auto-detected GPS coordinates, severity selector, category picker, camera/file upload with image preview, and AI-powered submission." },
            ].map((item) => (
              <div key={item.title} className="bg-white border border-neutral-200 rounded-xl p-5">
                <p className="text-sm font-bold text-neutral-900 mb-1.5">{item.title}</p>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Future Aspects ────────────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-neutral-900 mb-2 tracking-tight">Future Roadmap</h2>
          <p className="text-neutral-500 text-sm mb-6">Planned features for next phases of development.</p>
          <div className="space-y-3">
            {FUTURE_ASPECTS.map((item, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-900 mb-1">{item.title}</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-neutral-200 bg-white mt-4">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-500">
            © 2026 CivicAlert — Crowdsourced Civic Hazard Reporting System. Academic project.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-xs text-neutral-500 hover:text-[#E12D4B] transition-colors">Dashboard</Link>
            <Link href="/alerts"    className="text-xs text-neutral-500 hover:text-[#E12D4B] transition-colors">Alerts</Link>
            <Link href="/report"    className="text-xs text-neutral-500 hover:text-[#E12D4B] transition-colors">Report</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
