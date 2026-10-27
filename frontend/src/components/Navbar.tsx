"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Menu, X, Bell, BellOff, BellRing, Radio, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Dashboard",  href: "/dashboard" },
  { label: "Alerts",     href: "/alerts"    },
  { label: "About",      href: "/about"     },
];

type NotificationStatus = "default" | "granted" | "denied" | "unsupported";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationStatus>("default");
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Defer reading browser-only permission until after the initial hydration.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setNotificationStatus(
        "Notification" in window
          ? Notification.permission as NotificationStatus
          : "unsupported",
      );
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [popoverOpen]);

  const requestNotificationPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setToastMessage("Browser notifications are not supported on this device.");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission as NotificationStatus);

      if (permission === "granted") {
        setToastMessage("Emergency Push Alerts activated!");
        setTimeout(() => setToastMessage(null), 4000);

        try {
          new Notification("CivicAlert Emergency Broadcast System", {
            body: "Real-time hazard alerts & disaster warnings are now active for your area.",
            icon: "/favicon.ico",
          });
        } catch {
          // Fallback if Notification constructor fails
        }
      } else if (permission === "denied") {
        setToastMessage("Notifications blocked. Enable in browser site settings.");
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("Failed to request notification permission:", err);
    }
  };

  const handleBellClick = () => {
    if (notificationStatus === "default") {
      requestNotificationPermission();
    } else {
      setPopoverOpen((prev) => !prev);
    }
  };

  const sendTestNotification = () => {
    if (notificationStatus === "granted") {
      try {
        new Notification("🚨 Test Hazard Alert: Flash Flood Warning", {
          body: "High-priority flood advisory within 2.5 km of your position. (Simulation)",
          icon: "/favicon.ico",
        });
        setToastMessage("Test alert dispatched!");
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        setToastMessage("Test alert dispatched to in-app notification center.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } else {
      requestNotificationPermission();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-sm">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E12D4B] to-[#C01F3A] flex items-center justify-center shadow-sm group-hover:shadow-red-200 transition-shadow">
            <ShieldAlert size={16} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm font-bold text-neutral-900 tracking-tight">CivicAlert</span>
            <span className="hidden sm:block text-[10px] text-neutral-500 font-medium">Hazard Reporting System</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-50 text-[#E12D4B]"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 relative">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>

          {/* Alert bell with state indicator */}
          <div className="relative" ref={popoverRef}>
            <button
              onClick={handleBellClick}
              title={
                notificationStatus === "granted"
                  ? "Emergency alerts enabled (Click to manage)"
                  : notificationStatus === "denied"
                  ? "Alerts blocked (Click for help)"
                  : "Click to enable emergency alerts"
              }
              className={`relative w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                notificationStatus === "granted"
                  ? "border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700"
                  : notificationStatus === "denied"
                  ? "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-400"
                  : "border-neutral-200 hover:bg-neutral-50 text-neutral-600"
              }`}
            >
              {notificationStatus === "granted" ? (
                <BellRing size={16} className="text-emerald-600" />
              ) : notificationStatus === "denied" ? (
                <BellOff size={16} />
              ) : (
                <Bell size={16} />
              )}

              {/* Badge indicator */}
              {notificationStatus === "granted" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white" />
              )}
              {notificationStatus === "default" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E12D4B] rounded-full border border-white animate-pulse" />
              )}
              {notificationStatus === "denied" && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neutral-400 rounded-full border border-white" />
              )}
            </button>

            {/* Notification Popover Panel */}
            <AnimatePresence>
              {popoverOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 p-4 z-50 text-neutral-800"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        notificationStatus === "granted" ? "bg-emerald-100 text-emerald-700" :
                        notificationStatus === "denied" ? "bg-red-100 text-red-600" : "bg-neutral-100 text-neutral-600"
                      }`}>
                        {notificationStatus === "granted" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Alert Notifications
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      notificationStatus === "granted"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : notificationStatus === "denied"
                        ? "bg-red-50 text-red-700 border-red-200"
                        : "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {notificationStatus === "granted" ? "ACTIVE" : notificationStatus === "denied" ? "BLOCKED" : "DEFAULT"}
                    </span>
                  </div>

                  <div className="py-3 text-xs text-neutral-600 space-y-2">
                    {notificationStatus === "granted" ? (
                      <p>
                        ✅ Browser Web Push is active. You will receive real-time SOS broadcasts and disaster warnings.
                      </p>
                    ) : notificationStatus === "denied" ? (
                      <p className="text-red-600">
                        ⚠️ Alerts are blocked by your browser settings. To enable them, click the padlock/settings icon in the browser URL bar and allow notifications.
                      </p>
                    ) : (
                      <p>
                        Enable browser notifications to receive critical flash flood, road collapse, and emergency alerts instantly.
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex gap-2">
                    {notificationStatus === "granted" ? (
                      <button
                        onClick={sendTestNotification}
                        className="flex-1 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
                      >
                        Send Test Alert
                      </button>
                    ) : (
                      <button
                        onClick={requestNotificationPermission}
                        className="flex-1 py-2 text-xs font-semibold bg-[#E12D4B] hover:bg-[#C01F3A] text-white rounded-xl transition-colors"
                      >
                        Enable Alerts
                      </button>
                    )}
                    <button
                      onClick={() => setPopoverOpen(false)}
                      className="px-3 py-2 text-xs font-semibold border border-neutral-200 hover:bg-neutral-50 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SOS Report CTA */}
          <Link
            href="/report"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#E12D4B] to-[#C01F3A] text-white text-sm font-semibold rounded-lg shadow-sm shadow-red-200 hover:shadow-red-300 hover:from-[#C01F3A] hover:to-[#A8192E] active:scale-[0.97] transition-all"
          >
            <Radio size={13} />
            <span className="hidden sm:inline">Report Incident</span>
            <span className="sm:hidden">SOS</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Floating toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-neutral-700"
          >
            <BellRing size={14} className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-t border-neutral-100 bg-white px-4 py-3 space-y-1"
          >
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-red-50 text-[#E12D4B]" : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
