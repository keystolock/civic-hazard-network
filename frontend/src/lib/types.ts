// ── Core domain types for CivicAlert platform ─────────────────────────────

export type SeverityLevel = "extreme" | "severe" | "civic" | "resolved";
export type IncidentCategory = "All" | "Disaster" | "Road" | "Utilities" | "Medical";
export type RadiusFilter = "1km" | "5km" | "city";
export type IncidentStatus = "Open" | "In Progress" | "Resolved";

export interface Incident {
  id: string;
  title: string;
  aiSummary: string;           // AI-generated 1-line summary
  severity: SeverityLevel;
  category: Exclude<IncidentCategory, "All">;
  location: string;            // Human-readable address
  coordinates: [number, number]; // [lat, lng]
  timestamp: string;           // ISO string
  status: IncidentStatus;
  upvotes: number;
  reportCount: number;         // Merged duplicates
  reporter: string;
  verified: boolean;           // AI-verified genuine photo
  hasPhoto: boolean;
  photoUrl?: string;
}

export interface AlertBanner {
  id: string;
  title: string;
  severity: SeverityLevel;
  message: string;
  timestamp: string;
  affectedArea: string;
  source: "System" | "Authority" | "Citizen";
  active: boolean;
}

export interface StatItem {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "neutral";
  color: string;
}

export interface TechRow {
  layer: string;
  tech: string;
  usage: string;
  cost: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
  icon: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
  color: string;
}
