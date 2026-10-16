"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SosDispatchOverlayProps {
  onComplete?: () => void;
  responderCount?: number;
}

export default function SosDispatchOverlay({
  onComplete,
  responderCount = 14,
}: SosDispatchOverlayProps) {
  // Phase 1: "sending" (0ms - 1600ms)
  // Phase 2: "flying"  (1600ms - 2000ms)
  // Phase 3: "sent"    (2000ms - 2700ms)
  const [phase, setPhase] = useState<"sending" | "flying" | "sent">("sending");

  useEffect(() => {
    // Phase 1 -> Phase 2 at 1600ms
    const timerFly = setTimeout(() => {
      setPhase("flying");
    }, 1600);

    // Phase 2 -> Phase 3 at 2000ms
    const timerSent = setTimeout(() => {
      setPhase("sent");
    }, 2000);

    // Completion at 2700ms
    const timerDone = setTimeout(() => {
      if (onComplete) {
        onComplete();
      }
    }, 2700);

    return () => {
      clearTimeout(timerFly);
      clearTimeout(timerSent);
      clearTimeout(timerDone);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      <style jsx>{`
        @keyframes planeFloat {
          0% {
            transform: translateY(0px) rotate(-6deg);
          }
          50% {
            transform: translateY(-8px) rotate(4deg);
          }
          100% {
            transform: translateY(0px) rotate(-6deg);
          }
        }

        @keyframes planeFlyOff {
          0% {
            transform: translate(0px, 0px) rotate(-6deg) scale(1);
            opacity: 1;
          }
          20% {
            transform: translate(-10px, 10px) rotate(-10deg) scale(0.92);
            opacity: 1;
          }
          100% {
            transform: translate(160px, -160px) rotate(18deg) scale(0.15);
            opacity: 0;
          }
        }

        .plane-floating {
          animation: planeFloat 1.4s ease-in-out infinite;
        }

        .plane-flying {
          animation: planeFlyOff 550ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .plane-sent {
          opacity: 0;
          transform: translate(160px, -160px) scale(0.15);
          pointer-events: none;
        }
      `}</style>

      {/* Center animation container */}
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Subtle radar rings in background during sending phase */}
        {phase === "sending" && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: [0.8, 2.1], opacity: [0.6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
              className="absolute w-24 h-24 rounded-full bg-rose-100/60 border border-rose-200/50 pointer-events-none"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: [0.8, 1.6], opacity: [0.4, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
              className="absolute w-24 h-24 rounded-full bg-rose-50/70 border border-rose-100/40 pointer-events-none"
            />
          </>
        )}

        {/* 68x68 Two-Tone Crimson 3D Paper Plane SVG (#E11D48, #9F1239, #F43F5E) */}
        <div
          className={`relative z-10 transition-transform ${
            phase === "sending"
              ? "plane-floating"
              : phase === "flying"
              ? "plane-flying"
              : "plane-sent"
          }`}
        >
          <svg
            width="68"
            height="68"
            viewBox="0 0 68 68"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-[0_8px_16px_rgba(225,29,72,0.22)]"
          >
            {/* Main upper wing fold */}
            <path d="M10 33L58 10L36 58L27 40L10 33Z" fill="#E11D48" />
            {/* Underbelly keel crease shadow */}
            <path d="M27 40L36 58L31 38L27 40Z" fill="#9F1239" />
            {/* Top wing highlight bevel */}
            <path d="M10 33L31 38L58 10L10 33Z" fill="#F43F5E" />
            {/* Center spine ridge */}
            <path d="M27 40L31 38L58 10L27 40Z" fill="#BE123C" />
          </svg>
        </div>
      </div>

      {/* Typography block */}
      <div className="text-center mt-4 space-y-1">
        <div className="h-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {phase === "sent" ? (
              <motion.h3
                key="sent-heading"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-[19px] font-bold text-neutral-900 tracking-tight"
              >
                Message sent
              </motion.h3>
            ) : (
              <motion.h3
                key="sending-heading"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="text-[19px] font-bold text-neutral-900 tracking-tight"
              >
                Sending...
              </motion.h3>
            )}
          </AnimatePresence>
        </div>

        <p className="text-[13px] text-neutral-400 font-medium">
          Notifying {responderCount} first responders near you...
        </p>
      </div>
    </div>
  );
}
