import type { SessionSummary } from "./session";

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: "published" | "ongoing";
  registeredCount: number;
  organizerName: string;
}

export interface EventDetail extends EventSummary {
  sessions: SessionSummary[];
}

export interface EventFilters {
  searchTerm?: string;
  status?: "published" | "ongoing" | null;
  page?: number;
  size?: number;
}
