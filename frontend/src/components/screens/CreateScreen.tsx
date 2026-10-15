"use client";

import { useState, useRef } from "react";
import { Camera, Mic, Volume2, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Accident", "Medical/Critical", "Fire/Hazard", "Roadblock", "Rescue", "Flood", "Childbirth"];

const BASE_MESSAGE =
  "🚨 Urgent civic alert — need immediate emergency response assistance. Location: Connaught Place, New Delhi. Situation is critical. Please respond if you are available and nearby.";

interface Props {
  onSend: () => void;
}

export default function CreateScreen({ onSend }: Props) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [condition, setCondition] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(BASE_MESSAGE);
    u.lang = "en-IN";
    window.speechSynthesis.speak(u);
  };

  const startMic = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const recognition = new SR();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      setCondition((prev) => prev + " " + e.results[0][0].transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="h-[3px] bg-neutral-100 w-full">
        <div className="h-full w-4/5 bg-gradient-to-r from-[#E12D4B] to-[#F57C51] rounded-r-full" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-5 pb-4 space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Message request to responder
        </h2>

        {/* Auto-generated message */}
        <div className="bg-[#F7F7F8] rounded-2xl p-4 relative border border-neutral-200/60">
          <p className="text-[11px] font-bold text-neutral-500 tracking-wider uppercase mb-1.5">
            Your Message
          </p>
          <p className="text-sm text-neutral-700 leading-relaxed pr-10">{BASE_MESSAGE}</p>
          <button
            onClick={speak}
            className="absolute bottom-3 right-3 bg-white shadow-sm border border-neutral-200 p-2 rounded-xl hover:bg-neutral-50 transition-colors"
            aria-label="Read message aloud"
          >
            <Volume2 size={16} className="text-neutral-600" />
          </button>
        </div>

        {/* Condition input */}
        <div className="bg-[#F7F7F8] rounded-2xl p-4 relative border border-neutral-200/60 min-h-[115px]">
          <textarea
            className="w-full h-full bg-transparent text-sm text-neutral-700 placeholder:text-neutral-400 resize-none outline-none pr-20 min-h-[80px]"
            placeholder="Additional message / Incident condition..."
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
          {/* Photo preview */}
          <AnimatePresence>
            {photoPreview && (
              <motion.img
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                src={photoPreview}
                alt="preview"
                className="mt-2 w-20 h-20 object-cover rounded-xl border border-neutral-200"
              />
            )}
          </AnimatePresence>
          {/* Camera & Mic */}
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-white border border-neutral-200 p-2 rounded-xl hover:bg-neutral-50 transition-colors shadow-sm"
              aria-label="Attach photo"
            >
              <Camera size={16} className="text-neutral-500" />
            </button>
            <button
              onClick={startMic}
              className={`border p-2 rounded-xl transition-all shadow-sm ${
                isListening
                  ? "bg-rose-50 border-[#E12D4B] animate-pulse"
                  : "bg-white border-neutral-200 hover:bg-neutral-50"
              }`}
              aria-label="Voice input"
            >
              <Mic size={16} className={isListening ? "text-[#E12D4B]" : "text-neutral-500"} />
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? "bg-rose-50 border-[#E12D4B] text-[#E12D4B] font-semibold ring-2 ring-rose-100"
                    : "bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="px-4 py-4 border-t border-neutral-100 bg-white/90 backdrop-blur-sm">
        <button
          onClick={onSend}
          className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-gradient-to-r from-[#E62E4D] to-[#F04461] shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Send size={16} />
          Send to 14 responders
        </button>
      </div>
    </div>
  );
}
