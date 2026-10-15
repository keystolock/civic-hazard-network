"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ChatMessage } from "@/lib/types";
import { WA_INITIAL_MESSAGES } from "@/lib/mockData";

export default function WhatsAppScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>(WA_INITIAL_MESSAGES);
  const [showTyping, setShowTyping] = useState(false);

  const handleAction = (value: string, label: string) => {
    // Append user's outgoing bubble
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      from: "user",
      type: "text",
      text: label,
    };

    // Remove actions from the bot message
    setMessages((prev) =>
      prev
        .map((m) => (m.type === "action" ? { ...m, actions: undefined } : m))
        .concat(userMsg)
    );

    if (value === "accept") {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        const followUp: ChatMessage = {
          id: `b-${Date.now()}`,
          from: "bot",
          type: "action",
          text: "Great! 🙌 Can you reach the location within 30 minutes?",
          actions: [
            { label: "Yes, on my way!", value: "yes" },
            { label: "No, unable to", value: "no" },
          ],
        };
        setMessages((prev) => [...prev, followUp]);
      }, 2400);
    } else if (value === "yes" || value === "no") {
      setTimeout(() => {
        const confirm: ChatMessage = {
          id: `b2-${Date.now()}`,
          from: "bot",
          type: "text",
          text:
            value === "yes"
              ? "✅ Perfect! You've been confirmed. The requester has been notified. Thank you for helping! 🫶"
              : "Understood. We've notified other available responders near you. Thank you for replying!",
        };
        setMessages((prev) => [...prev, confirm]);
      }, 800);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* WA Header */}
      <div className="flex-shrink-0 bg-[#075E54] px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#128C7E] flex items-center justify-center text-white font-bold text-sm">
          CA
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-none">CivicAlert Verified Business</p>
          <p className="text-[#a0d4cd] text-xs mt-0.5">RaktKhoj / CivicAlert • Verified ✓</p>
        </div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" opacity="0.8">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto whatsapp-bg px-3 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22 }}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                  msg.from === "user"
                    ? "bg-[#D9FDD3] rounded-br-sm text-neutral-800"
                    : "bg-white rounded-bl-sm text-neutral-800"
                }`}
              >
                {/* Bot icon for first bot message */}
                {msg.from === "bot" && msg.type === "action" && (
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-5 h-5 rounded-full bg-rose-100 flex items-center justify-center">
                      <span className="text-[10px]">🚨</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#075E54] uppercase tracking-wide">CivicAlert Alert</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex gap-2 mt-3 pt-2.5 border-t border-neutral-200/60">
                    {msg.actions.map((a) => (
                      <button
                        key={a.value}
                        onClick={() => handleAction(a.value, a.label)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                          a.value === "accept" || a.value === "yes"
                            ? "bg-[#25D366] hover:bg-[#20bd5a] text-white"
                            : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                        }`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-neutral-400 mt-1 text-right">
                  {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center">
                <span className="w-2 h-2 rounded-full bg-neutral-400 typing-dot-1 inline-block" />
                <span className="w-2 h-2 rounded-full bg-neutral-400 typing-dot-2 inline-block" />
                <span className="w-2 h-2 rounded-full bg-neutral-400 typing-dot-3 inline-block" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WA input bar */}
      <div className="flex-shrink-0 bg-[#F0F2F5] px-3 py-2.5 flex items-center gap-2 border-t border-neutral-200/60">
        <div className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-neutral-400 shadow-sm">
          Type a message
        </div>
        <button className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center shadow-sm flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
