"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Image as ImageIcon, Cpu, ChevronRight, CheckCircle, Navigation, Camera, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SeverityLevel, IncidentCategory } from "@/lib/types";
import { SEVERITY_CONFIG } from "@/lib/mockData";

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
    photoPreview: null as string | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const detectGPS = () => {
    setForm((f) => ({ ...f, location: "Detecting GPS…", gpsDetected: false }));
    setTimeout(() => {
      setForm((f) => ({ ...f, location: "Connaught Place, New Delhi (28.6310°N, 77.2167°E)", gpsDetected: true }));
    }, 1400);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photoPreview: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2200);
  };

  const canProceed1 = form.location && form.gpsDetected;
  const canProceed2 = form.title && form.category && form.severity;

  // ── Submitted confirmation ──────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-neutral-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Report Submitted!</h2>
          <p className="text-neutral-500 text-sm mb-1">
            Your incident has been sent for <span className="font-semibold text-blue-600">AI verification</span>.
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            If similar reports exist within 200m, they will be merged automatically.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left mb-6">
            <p className="text-xs font-bold text-blue-800 mb-1 uppercase tracking-wide">What happens next?</p>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Gemini AI verifies the photo & generates a summary</li>
              <li>• Duplicate reports within 200–300m are merged</li>
              <li>• High-priority alerts sent via SMS + Telegram</li>
              <li>• Municipal authorities are notified instantly</li>
            </ul>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setSubmitted(false); setStep(1); setForm({ title:"",description:"",category:"",severity:"",location:"",gpsDetected:false,photoPreview:null }); }}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Report Another
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E12D4B] to-[#C01F3A] text-white text-sm font-semibold shadow-sm hover:shadow-red-200 transition-all"
            >
              View Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Main wizard ─────────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-64px)] bg-neutral-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Report an Incident</h1>
          <p className="text-neutral-500 text-sm mt-1">
            3-step report sent for AI verification. Takes under 60 seconds.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-0 mb-8">
          {([1, 2, 3] as Step[]).map((s, i) => {
            const done    = step > s;
            const current = step === s;
            const labels  = ["Location", "Details", "Photo & Submit"];
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
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📍 Confirm Location</h2>
                  <p className="text-sm text-neutral-500">Auto-detect your GPS position or enter manually.</p>
                </div>

                {/* GPS button */}
                <button
                  onClick={detectGPS}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#E12D4B] hover:bg-red-50 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${form.gpsDetected ? "bg-green-100" : "bg-neutral-100 group-hover:bg-red-100"}`}>
                    <Navigation size={18} className={form.gpsDetected ? "text-green-600" : "text-neutral-500 group-hover:text-[#E12D4B]"} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-800">
                      {form.gpsDetected ? "✓ GPS Detected" : "Auto-Detect GPS Location"}
                    </p>
                    {form.location ? (
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{form.location}</p>
                    ) : (
                      <p className="text-xs text-neutral-400">Tap to get your current coordinates</p>
                    )}
                  </div>
                  {form.gpsDetected && <CheckCircle size={18} className="text-green-500 flex-shrink-0" />}
                </button>

                {/* Manual input */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">
                    Or enter location manually
                  </label>
                  <div className="flex items-center gap-2 border border-neutral-200 rounded-xl px-3 py-2.5">
                    <MapPin size={14} className="text-neutral-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm((f) => ({ ...f, location: e.target.value, gpsDetected: e.target.value.length > 5 }))}
                      placeholder="e.g. ITO Bridge, New Delhi"
                      className="flex-1 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none"
                    />
                  </div>
                </div>

                {/* Info box */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-700">
                  <strong>Why location matters:</strong> Our backend checks if another report exists within 200–300m in the last 6 hours and merges duplicates automatically.
                </div>
              </div>
            )}

            {/* ── Step 2: Category & Details ───────────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📝 Incident Details</h2>
                  <p className="text-sm text-neutral-500">Select severity and describe the hazard.</p>
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
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
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
                            ? "bg-neutral-900 text-white border-neutral-900"
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
                    placeholder="e.g. Large pothole on Ring Road near Moti Bagh"
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-[#E12D4B] transition-colors"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide block mb-1.5">Additional Details</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Describe the hazard: size, danger level, number of people affected..."
                    className="w-full border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none focus:border-[#E12D4B] transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* ── Step 3: Photo & Submit ────────────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 mb-1">📸 Add Photo</h2>
                  <p className="text-sm text-neutral-500">A photo helps Gemini AI verify the incident and generate an accurate summary.</p>
                </div>

                {/* Photo upload area */}
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
                  {form.photoPreview ? (
                    <div className="relative rounded-xl overflow-hidden border border-neutral-200">
                      <img src={form.photoPreview} alt="preview" className="w-full h-56 object-cover" />
                      <button
                        onClick={(e) => { e.preventDefault(); setForm((f) => ({ ...f, photoPreview: null })); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center"
                      >
                        <X size={14} className="text-white" />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                        <Cpu size={10} /> Pending AI verification
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-neutral-300 hover:border-[#E12D4B] rounded-xl p-10 text-center transition-all group">
                      <div className="w-12 h-12 bg-neutral-100 group-hover:bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors">
                        <Camera size={22} className="text-neutral-400 group-hover:text-[#E12D4B]" />
                      </div>
                      <p className="text-sm font-semibold text-neutral-700 group-hover:text-[#E12D4B]">Click to upload a photo</p>
                      <p className="text-xs text-neutral-400 mt-1">JPG, PNG, HEIC — Max 10 MB</p>
                    </div>
                  )}
                </label>

                {/* AI info box */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                  <Cpu size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-800 mb-1">How AI Verification Works</p>
                    <p className="text-xs text-blue-700">Gemini API checks your photo to confirm it shows a genuine civic hazard and automatically writes a one-line summary — e.g. <em>"Severe mudslide blocking two lanes on NH-58 near Devprayag"</em></p>
                  </div>
                </div>

                {/* Summary of report */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Report Summary</p>
                  <p className="text-sm font-semibold text-neutral-900">{form.title}</p>
                  <p className="text-xs text-neutral-500">{form.location}</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">{form.category}</span>
                    {form.severity && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.light} ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.text} ${SEVERITY_CONFIG[form.severity as SeverityLevel]?.border} border`}>
                        {SEVERITY_CONFIG[form.severity as SeverityLevel]?.label}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E12D4B] to-[#C01F3A] text-white font-bold text-sm shadow-md shadow-red-200 hover:shadow-red-300 active:scale-[0.98] disabled:opacity-70 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Submitting & Verifying with AI...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Submit Report
                    </>
                  )}
                </button>
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
