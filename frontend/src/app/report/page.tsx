"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin, Cpu, ChevronRight, CheckCircle, Navigation,
  Camera, X, AlertTriangle, Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SeverityLevel, IncidentCategory } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/mockData";
import SosDispatchOverlay from "@/components/report/SosDispatchOverlay";

type Step = 1 | 2 | 3;

const CATEGORIES: Exclude<IncidentCategory, "All">[] = ["Disaster", "Road", "Utilities", "Medical"];

const SEVERITY_OPTIONS: { value: SeverityLevel; label: string; desc: string; example: string }[] = [
  { value: "extreme", label: "🔴 Extreme Emergency", desc: "Natural disaster, life-threatening", example: "Landslide, Flash flood" },
  { value: "severe",  label: "🟠 Severe Hazard",     desc: "Immediate danger to public",       example: "Road cave-in, Live wire" },
  { value: "civic",   label: "🟡 Civic Complaint",    desc: "Non-urgent civic issue",            example: "Pothole, Garbage pile" },
];

export default function ReportPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "" as Exclude<IncidentCategory, "All"> | "",
    severity: "" as SeverityLevel | "",
    location: "",
    gpsDetected: false,
    latitude: null as number | null,
    longitude: null as number | null,
    accuracy: null as number | null,
    photoPreview: null as string | null,
  });

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ── Browser Geolocation with Fallback & Reverse Geocoding ─────────────
  const detectGPS = () => {
    setGpsError(null);

    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser. You can enter location manually.");
      setForm((f) => ({
        ...f,
        location: "New Delhi Central (28.6139°N, 77.2090°E) [Fallback]",
        latitude: 28.6139,
        longitude: 77.2090,
        gpsDetected: true,
      }));
      return;
    }

    setGpsLoading(true);
    setForm((f) => ({ ...f, location: "Contacting GPS satellites...", gpsDetected: false }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        setForm((f) => ({
          ...f,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          gpsDetected: true,
          location: `Coordinates: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E (±${acc}m accuracy)`,
        }));
        setGpsLoading(false);

        // Attempt reverse geocoding via OpenStreetMap Nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          if (res.ok) {
            const data = await res.json();
            const place = data.display_name;
            if (place) {
              const shortPlace = place.split(",").slice(0, 3).join(", ");
              setForm((f) => ({
                ...f,
                location: `${shortPlace} (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E)`,
              }));
            }
          }
        } catch {
          // Keep coordinates fallback already set
        }
      },
      (err) => {
        setGpsLoading(false);
        let msg = "Could not fetch GPS coordinates.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location permission denied. Please allow location access or type manually.";
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = "GPS signal unavailable. Applied default area coordinates.";
        } else if (err.code === err.TIMEOUT) {
          msg = "GPS request timed out. Applied area fallback coordinates.";
        }
        setGpsError(msg);

        // Friendly fallback coordinates so flow is never blocked
        setForm((f) => ({
          ...f,
          location: "Connaught Place, New Delhi (28.6310°N, 77.2167°E) [Fallback]",
          latitude: 28.6310,
          longitude: 77.2167,
          accuracy: 50,
          gpsDetected: true,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  // ── SOS Submission Handler ──────────────────────────────────────────
  const handleSubmit = () => {
    setSubmitting(true);
  };

  const canProceed1 = form.location && form.gpsDetected;
  const canProceed2 = form.title && form.category && form.severity;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 py-8 px-4 relative">
      {/* ── 3-STAGE FULL-SCREEN SOS DISPATCH ANIMATION OVERLAY ── */}
      <AnimatePresence>
        {submitting && (
          <SosDispatchOverlay onComplete={() => router.push("/dashboard")} />
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Report an Incident</h1>
          <p className="text-neutral-500 text-sm mt-1">
            3-step incident broadcast with automated GPS coordinates and AI deduplication.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const done    = step > s;
            const current = step === s;
            const labels  = ["Location", "Details", "Photo & SOS"];
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    done    ? "bg-emerald-600 border-emerald-600 text-white" :
                    current ? "bg-[#E12D4B] border-[#E12D4B] text-white" :
                              "bg-white border-neutral-300 text-neutral-400"
                  }`}>
                    {done ? <CheckCircle size={14} /> : s}
                  </div>
                  <span className={`text-[10px] font-semibold mt-1 ${current ? "text-[#E12D4B]" : done ? "text-emerald-600" : "text-neutral-400"}`}>
                    {labels[i]}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all ${step > s ? "bg-emerald-400" : "bg-neutral-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 md:p-8"
          >
            {/* ── Step 1: Location ─────────────────────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📍 Auto-Detect Location</h2>
                  <p className="text-sm text-neutral-500">
                    Acquire real GPS coordinates from your device for 200m spatial deduplication.
                  </p>
                </div>

                {/* GPS button */}
                <button
                  onClick={detectGPS}
                  disabled={gpsLoading}
                  className={`w-full flex items-center gap-3.5 p-4 rounded-2xl border-2 transition-all text-left group ${
                    form.gpsDetected
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-dashed border-neutral-300 hover:border-[#E12D4B] hover:bg-red-50/40"
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    gpsLoading
                      ? "bg-amber-100 text-amber-600"
                      : form.gpsDetected
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-neutral-100 text-neutral-600 group-hover:bg-red-100 group-hover:text-[#E12D4B]"
                  }`}>
                    {gpsLoading ? (
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Navigation size={20} className={form.gpsDetected ? "rotate-45" : ""} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-neutral-800">
                      {gpsLoading
                        ? "Connecting to GPS..."
                        : form.gpsDetected
                        ? "GPS Location Locked"
                        : "Detect Device GPS Position"}
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">
                      {form.location || "Tap to request browser coordinates (High accuracy mode)"}
                    </p>
                  </div>
                  {form.gpsDetected && !gpsLoading && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex-shrink-0">
                      Active
                    </span>
                  )}
                </button>

                {/* GPS warning / error message if any */}
                {gpsError && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                    <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{gpsError}</span>
                  </div>
                )}

                {/* Manual input */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">
                    Or adjust landmark / address manually
                  </label>
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#E12D4B] transition-colors">
                    <MapPin size={16} className="text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          location: e.target.value,
                          gpsDetected: e.target.value.length > 5,
                        }))
                      }
                      placeholder="e.g. ITO Bridge, Ring Road, New Delhi"
                      className="flex-1 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none"
                    />
                  </div>
                </div>

                {/* Spatial Deduplication explanation */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Cpu size={13} className="text-blue-600" /> Automated 200–300m Deduplication
                  </p>
                  <p className="text-blue-700 leading-relaxed">
                    When you submit, PostGIS spatial queries verify if another report exists within a 200–300 meter radius under 6 hours. Duplicate incidents are merged automatically into a single high-priority ticket.
                  </p>
                </div>
              </div>
            )}

            {/* ── Step 2: Category & Details ───────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📝 Incident Details</h2>
                  <p className="text-sm text-neutral-500">Assign hazard severity according to the civic sign convention.</p>
                </div>

                {/* Severity selector */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">
                    Severity Level
                  </label>
                  <div className="space-y-2">
                    {SEVERITY_OPTIONS.map((opt) => {
                      const cfg = SEVERITY_CONFIG[opt.value];
                      const selected = form.severity === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setForm((f) => ({ ...f, severity: opt.value }))}
                          className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all ${
                            selected ? `${cfg.border} ${cfg.light}` : "border-neutral-200 hover:border-neutral-300 bg-white"
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${selected ? cfg.text : "text-neutral-800"}`}>{opt.label}</p>
                            <p className="text-xs text-neutral-500">{opt.desc} — e.g. {opt.example}</p>
                          </div>
                          {selected && <CheckCircle size={16} className={cfg.text} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-2">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, category: c }))}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          form.category === c
                            ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                            : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Incident Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Flash flood submerging ITO underpass"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-[#E12D4B] transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Additional Details</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe the condition, lane blockage, water depth, or immediate danger..."
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-[#E12D4B] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Step 3: Photo & SOS Submit ───────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📸 Photo &amp; Emergency Dispatch</h2>
                  <p className="text-sm text-neutral-500">
                    Uploaded photos are evaluated by Gemini AI for validity and automated one-line summary generation.
                  </p>
                </div>

                {/* Photo upload area */}
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  {form.photoPreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-neutral-200 group">
                      <img src={form.photoPreview} alt="preview" className="w-full h-56 object-cover" />
                      <button
                        onClick={(e) => { e.preventDefault(); setForm((f) => ({ ...f, photoPreview: null })); }}
                        className="absolute top-2.5 right-2.5 w-8 h-8 bg-black/70 hover:bg-black rounded-full flex items-center justify-center transition-colors"
                      >
                        <X size={15} className="text-white" />
                      </button>
                      <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-sm text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <Cpu size={12} className="text-blue-400" /> Image Hash &amp; Gemini AI ready
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#E12D4B] rounded-2xl p-8 text-center transition-all group bg-neutral-50/50 hover:bg-red-50/20">
                      <div className="w-12 h-12 bg-white group-hover:bg-red-50 border border-neutral-200 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-colors shadow-sm">
                        <Camera size={22} className="text-neutral-400 group-hover:text-[#E12D4B]" />
                      </div>
                      <p className="text-sm font-bold text-neutral-800 group-hover:text-[#E12D4B]">Upload Hazard Photo</p>
                      <p className="text-xs text-neutral-400 mt-1">Camera snap or photo picker (JPG, PNG, HEIC)</p>
                    </div>
                  )}
                </label>

                {/* Summary of report */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Report Manifest</p>
                  <p className="text-sm font-bold text-neutral-900">{form.title || "Emergency Report"}</p>
                  <p className="text-xs text-neutral-600 flex items-center gap-1">
                    <MapPin size={12} className="text-neutral-400" /> {form.location}
                  </p>
                  <div className="flex gap-2 flex-wrap pt-1">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                      {form.category}
                    </span>
                    {form.severity && (
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.light} ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.text} ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.border} border`}>
                        {SEVERITY_CONFIG[form.severity as SeverityLevel]?.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* ── SOS SUBMISSION BUTTON ── */}
                <div className="pt-2">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#E12D4B] via-[#EB3453] to-[#B81D38] text-white font-extrabold text-sm shadow-xl shadow-red-500/25 hover:shadow-red-500/35 active:scale-[0.98] disabled:opacity-80 transition-all flex items-center justify-center gap-2"
                  >
                    <Send size={18} className="transform rotate-[-12deg]" />
                    <span>Send Incident &amp; Broadcast SOS</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="flex-1 py-3 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              ← Back
            </button>
          )}
          {step < 3 && (
            <button
              onClick={() => setStep((s) => (s + 1) as Step)}
              disabled={(step === 1 && !canProceed1) || (step === 2 && !canProceed2)}
              className="flex-1 py-3 rounded-xl bg-neutral-900 text-white text-sm font-semibold hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              Continue <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
