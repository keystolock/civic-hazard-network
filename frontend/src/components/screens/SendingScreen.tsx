"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";

interface Props {
  onComplete: () => void;
}

export default function SendingScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2800);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-white gap-6 select-none">
      {/* Paper plane animation */}
      <motion.div
        animate={{
          x: [-20, 15, -5, 25, 0],
          y: [10, -25, -10, -35, -20],
          rotate: [-8, 12, -4, 15, 5],
          scale: [0.95, 1.08, 1.02, 1.12, 1],
        }}
        transition={{
          duration: 2.6,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        }}
      >
        {/* Telegram-style crimson paper plane SVG */}
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main body */}
          <path
            d="M8 36L62 10L46 62L32 44L8 36Z"
            fill="#E12D4B"
          />
          {/* Dark fold / shadow crease */}
          <path
            d="M32 44L46 62L38 38L32 44Z"
            fill="#B81D38"
          />
          {/* Wing highlight */}
          <path
            d="M8 36L38 38L62 10L8 36Z"
            fill="#F04461"
          />
          {/* Inner crease */}
          <path
            d="M32 44L38 38L62 10L32 44Z"
            fill="#C92040"
          />
        </svg>
      </motion.div>

      {/* Trailing dots */}
      <motion.div
        className="flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#E12D4B]"
            animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </motion.div>

      {/* Status text */}
      <div className="text-center space-y-1">
        <motion.p
          className="text-base font-bold text-neutral-800"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          Sending...
        </motion.p>
        <motion.p
          className="text-xs text-neutral-400"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          Notifying 14 responder(s) near you...
        </motion.p>
      </div>
    </div>
  );
}
