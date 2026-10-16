"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import type { IncidentCategory, RadiusFilter } from "@/lib/types";

const CATEGORIES: IncidentCategory[] = ["All", "Disaster", "Road", "Utilities", "Medical"];
const RADII: { value: RadiusFilter; label: string }[] = [
  { value: "1km",  label: "1 km"      },
  { value: "5km",  label: "5 km"      },
  { value: "city", label: "City-wide" },
];

interface Props {
  category: IncidentCategory;
  radius: RadiusFilter;
  search: string;
  onCategory: (c: IncidentCategory) => void;
  onRadius:   (r: RadiusFilter)     => void;
  onSearch:   (s: string)           => void;
  count: number;
}

export default function FilterBar({ category, radius, search, onCategory, onRadius, onSearch, count }: Props) {
  return (
    <div className="flex-shrink-0 bg-white border-b border-neutral-200/80 px-4 py-3 space-y-3">
      {/* Row 1: category tabs + count */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((c) => {
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => onCategory(c)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  active
                    ? "bg-[#E12D4B] text-white border-[#E12D4B] shadow-sm shadow-red-200"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <span className="flex-shrink-0 text-xs font-semibold text-neutral-500 bg-neutral-100 px-2.5 py-1 rounded-full">
          {count} reports
        </span>
      </div>

      {/* Row 2: search + radius */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="flex-1 flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2">
          <Search size={13} className="text-neutral-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search incidents, locations..."
            className="flex-1 bg-transparent text-xs text-neutral-700 placeholder:text-neutral-400 outline-none"
          />
        </div>

        {/* Radius pills */}
        <div className="flex items-center gap-1">
          {RADII.map((r) => {
            const active = radius === r.value;
            return (
              <button
                key={r.value}
                onClick={() => onRadius(r.value)}
                className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  active
                    ? "bg-neutral-900 text-white border-neutral-900"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300"
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
