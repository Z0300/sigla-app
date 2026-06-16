import type { EventFilters } from "#/types/event";

export const eventKeys = {
  all: () => ["events"] as const,
  list: (filters: EventFilters) => ["events", "list", filters] as const,
  detail: (id: number) => ["events", "detail", id] as const,
  myReg: (eventId: number) => ["events", eventId, "my-registration"] as const,

  organizerAll: () => ["events", "organizer"] as const,
  organizerList: (filters: EventFilters) =>
    ["events", "organizer", "list", filters] as const,
};
