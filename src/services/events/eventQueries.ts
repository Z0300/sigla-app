import { api } from "#/lib/axios";
import type { AttendeeSimple, PaginatedResponse } from "#/types";
import type { EventDetail, EventFilters, EventSummary } from "#/types/event";
import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "./eventKeys";

export function usePublicEvents(filters: EventFilters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async () =>
      await api
        .get<
          PaginatedResponse<EventSummary>
        >("/v1/events/public", { params: filters })
        .then((d) => d.data),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useEventDetail(eventId: number) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: async () => {
      const { data } = await api.get<EventDetail>(`/v1/events/${eventId}`);
      return data;
    },
    enabled: !!eventId,
  });
}

export function useMyRegistration(eventId: number) {
  return useQuery({
    queryKey: eventKeys.myReg(eventId),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<AttendeeSimple>>(
        `/v1/events/${eventId}/attendees/me`,
      );
      return data.data;
    },
    enabled: !!eventId,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}
