import type { SessionSummary } from "./session";

export enum EventStatus {
  draft = "draft",
  published = "published",
  ongoing = "ongoing",
  completed = "completed",
  cancelled = "cancelled",
}

export interface EventSummary {
  id: number;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus.published | EventStatus.ongoing;
  registeredCount: number;
  organizerName: string;
}

export interface EventFormValues {
  title: string;
  description?: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

export interface SessionFormValues {
  title: string;
  room: string;
  startTime: string;
  endTime: string;
  capacity: number;
}

export interface OrganizerEvent {
  id: number;
  title: string;
  description: string;
  venue: string;
  startDate: string;
  endDate: string;
  capacity: number;
  status: EventStatus;
  registeredCount: number;
}

export interface OrganizerSession {
  id: number;
  eventId: number;
  eventTitle: string;
  title: string;
  room: string;
  startTime: string;
  endTime: string;
  capacity: number;
  checkInCount: number;
  createdAt: string;
  hasConflict?: boolean;
  conflictingSessions?: OrganizerSession;
}

export interface OrganizerAttendee {
  id: number;
  userId: number;
  userFullName: string;
  userEmail: string;
  status: "registered" | "checked_in" | "cancelled" | "no_show";
  registeredAt: string;
}

export interface EventDetail extends EventSummary {
  sessions: SessionSummary[];
}

export type PublicEventStatus = EventStatus.published | EventStatus.ongoing;

export interface EventFilters {
  searchTerm?: string;
  status?: PublicEventStatus | null;
  page?: number;
  size?: number;
}

export interface OrganizerEventFilters {
  search?: string;
  searchTerm?: string;
  status?: EventStatus;
  page?: number;
  size?: number;
}
