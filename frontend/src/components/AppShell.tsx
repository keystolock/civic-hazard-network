"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import type { Screen } from "@/lib/types";

// Layout components
import DesktopSidebar    from "@/components/DesktopSidebar";
import DesktopTopBar     from "@/components/DesktopTopBar";
import DesktopRightPanel from "@/components/DesktopRightPanel";
import MobileHeader      from "@/components/MobileHeader";
import MobileBottomNav   from "@/components/MobileBottomNav";

// Screen components
import CreateScreen   from "@/components/screens/CreateScreen";
import SendingScreen  from "@/components/screens/SendingScreen";
import TrackerScreen  from "@/components/screens/TrackerScreen";
import HubsScreen     from "@/components/screens/HubsScreen";
import WhatsAppScreen from "@/components/screens/WhatsAppScreen";

const SCREEN_ORDER: Screen[] = ["create", "sending", "tracker", "hubs", "whatsapp"];

function ScreenContent({ screen, onSend, onSendComplete }: {
  screen: Screen;
  onSend: () => void;
  onSendComplete: () => void;
}) {
  switch (screen) {
    case "create":   return <CreateScreen onSend={onSend} />;
    case "sending":  return <SendingScreen onComplete={onSendComplete} />;
    case "tracker":  return <TrackerScreen />;
    case "hubs":     return <HubsScreen />;
    case "whatsapp": return <WhatsAppScreen />;
    default:         return null;
  }
}

export default function AppShell() {
  const [screen, setScreen] = useState<Screen>("create");
  const [prevScreen, setPrevScreen] = useState<Screen>("create");

  const navigate = useCallback((s: Screen) => {
    // Never navigate directly to "sending" via nav
    if (s === "sending") return;
    setPrevScreen(screen);
    setScreen(s);
  }, [screen]);

  const handleSend = useCallback(() => {
    setPrevScreen(screen);
    setScreen("sending");
  }, [screen]);

  const handleSendComplete = useCallback(() => {
    setPrevScreen("sending");
    setScreen("tracker");
  }, []);

  const handleBack = useCallback(() => {
    const idx = SCREEN_ORDER.indexOf(screen);
    if (idx > 0) setScreen(SCREEN_ORDER[idx - 1]);
  }, [screen]);

  // Determine animation direction
  const currIdx = SCREEN_ORDER.indexOf(screen);
  const prevIdx = SCREEN_ORDER.indexOf(prevScreen);
  const dir = currIdx >= prevIdx ? 1 : -1;

  return (
    /**
     * ROOT: full viewport, flex row.
     * - Mobile (<lg): full-screen column layout
     * - Desktop (lg+): sidebar | main | right panel
     */
    <div className="flex h-screen w-full overflow-hidden bg-[#F6F4F2]">

      {/* ── Desktop left sidebar ─────────────────────────────── */}
      <DesktopSidebar activeScreen={screen} onNavigate={navigate} />

      {/* ── Main content area ────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full">

        {/* Desktop top bar */}
        <DesktopTopBar activeScreen={screen} />

        {/* Mobile header */}
        <MobileHeader screen={screen} onBack={handleBack} onClose={() => {}} />

        {/* Scrollable screen content */}
        <main className="flex-1 overflow-hidden relative">
          {/**
           * Desktop: content is shown directly in the main area with a card
           * Mobile: content fills the full screen
           */}
          <div className="h-full flex lg:items-start lg:justify-center lg:p-6">
            <div className="
              h-full w-full
              lg:h-full lg:max-w-2xl lg:w-full
              lg:bg-white lg:rounded-2xl lg:shadow-sm lg:border lg:border-neutral-200/70
              lg:overflow-hidden lg:flex lg:flex-col
            ">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={screen}
                  initial={{ opacity: 0, x: dir * 28 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: dir * -28 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="h-full flex flex-col"
                >
                  <ScreenContent
                    screen={screen}
                    onSend={handleSend}
                    onSendComplete={handleSendComplete}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Mobile bottom nav */}
        <MobileBottomNav active={screen} onNavigate={navigate} />
      </div>

      {/* ── Desktop right panel ───────────────────────────────── */}
      <DesktopRightPanel activeScreen={screen} />
    </div>
  );
}
