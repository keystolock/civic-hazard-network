import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CivicAlert — Crowdsourced Civic Hazard Reporting & Disaster Alert System",
  description:
    "Real-time, AI-verified crowdsourced platform where citizens report road hazards, natural disasters, and civic complaints — with live mapping and instant emergency alerts.",
  keywords: ["civic hazard", "disaster alert", "emergency reporting", "crowdsourced", "AI verification"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${font.variable} h-full`}>
      <head>
        {/* Leaflet CSS — loaded as <link> to avoid PostCSS @import ordering conflict with Tailwind v4 */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          crossOrigin=""
        />
      </head>
      <body className="h-full antialiased" style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
