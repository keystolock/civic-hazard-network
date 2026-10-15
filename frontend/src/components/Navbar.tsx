"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Menu, X, Bell, AlertTriangle, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { label: "Dashboard",  href: "/dashboard" },
  { label: "Alerts",     href: "/alerts"    },
  { label: "About",      href: "/about"     },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

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
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live
          </div>

          {/* Alert bell */}
          <button className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-neutral-200 hover:bg-neutral-50 transition-colors text-neutral-600">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>

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
