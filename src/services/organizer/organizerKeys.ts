import type { OrganizerEventFilters } from "#/types/event";

export const eventKeys = {
  organizerAll: () => ["events", "organizer"] as const,
  organizerList: (filters: OrganizerEventFilters) =>
    ["events", "organizer", "list", filters] as const,
  organizerDetail: (id: number) => ["events", "organizer", id] as const,
  organizerSessions: (eventId: number) =>
    ["events", "organizer", eventId, "sessions"] as const,
  organizerAttendees: (
    eventId: number,
    status?: string | null,
    page?: number,
  ) => ["events", "organizer", eventId, "attendees", { status, page }] as const,
};
