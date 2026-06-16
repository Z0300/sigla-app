import { api } from "#/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "./organizerKeys";
import type {
  EventDetail,
  OrganizerAttendee,
  OrganizerEvent,
  OrganizerEventFilters,
  PaginatedResponse,
  SessionSummary,
  SingleResponse,
} from "#/types";

export function useOrganizerEvents(filters: OrganizerEventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.organizerList(filters),
    queryFn: async () =>
      api
        .get<
          PaginatedResponse<OrganizerEvent>
        >("/v1/events", { params: filters })
        .then((d) => d.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useOrganizerEventDetail(eventId: number) {
  return useQuery({
    queryKey: eventKeys.organizerDetail(eventId),
    queryFn: async () => {
      const { data } = await api.get<SingleResponse<EventDetail>>(
        `/events/withSession/${eventId}`,
      );
      return data.data;
    },
    enabled: !!eventId,
  });
}

export function useSessions(eventId: number) {
  return useQuery({
    queryKey: eventKeys.organizerSessions(eventId),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<SessionSummary>>(
        `/events/${eventId}/sessions`,
      );
      return data.data;
    },
    enabled: !!eventId,
  });
}

export function useEventAttendees(
  eventId: number,
  status: string | null = null,
  page: number = 0,
) {
  return useQuery({
    queryKey: eventKeys.organizerAttendees(eventId, status, page),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<OrganizerAttendee>>(
        `/events/${eventId}/attendees`,
        { params: { status: status || undefined, page, size: 10 } },
      );
      return data.data;
    },
    enabled: !!eventId,
  });
}
