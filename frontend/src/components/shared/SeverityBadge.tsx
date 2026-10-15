"use client";

import { SEVERITY_CONFIG } from "@/lib/mockData";
import type { SeverityLevel } from "@/lib/types";

interface Props {
  severity: SeverityLevel;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

const SIZE = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export default function SeverityBadge({ severity, size = "md", showDot = true }: Props) {
  const cfg = SEVERITY_CONFIG[severity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${SIZE[size]} ${cfg.light} ${cfg.text} ${cfg.border}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />}
      {cfg.label}
    </span>
  );
}
