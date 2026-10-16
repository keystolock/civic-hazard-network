"use client";

import { useState, useEffect } from "react";

interface TimeAgoProps {
  iso: string;
  className?: string;
  fallback?: string;
}

/**
 * Calculates human-readable relative time without server/client drift
 */
export function formatTimeAgo(iso: string, now: number = Date.now()): string {
  if (!iso) return "recently";
  const time = new Date(iso).getTime();
  if (isNaN(time)) return "recently";
  const diffMinutes = Math.max(0, (now - time) / 60000);

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${Math.round(diffMinutes)}m ago`;
  if (diffMinutes < 1440) return `${Math.round(diffMinutes / 60)}h ago`;
  return `${Math.round(diffMinutes / 1440)}d ago`;
}

/**
 * Client-safe TimeAgo component that completely eliminates Next.js hydration mismatches.
 * Renders consistent fallback on server/initial client hydration, then updates on mount.
 */
export default function TimeAgo({ iso, className, fallback = "recently" }: TimeAgoProps) {
  const [displayText, setDisplayText] = useState<string>(fallback);

  useEffect(() => {
    // Evaluate only on client after mount
    setDisplayText(formatTimeAgo(iso));

    const interval = setInterval(() => {
      setDisplayText(formatTimeAgo(iso));
    }, 30000);

    return () => clearInterval(interval);
  }, [iso]);

  return (
    <span className={className} suppressHydrationWarning title={iso}>
      {displayText}
    </span>
  );
}
