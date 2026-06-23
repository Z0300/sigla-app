import { api } from "#/lib/axios";
import {
  type AttendeeSimple,
  type PaginatedResponse,
  type SingleResponse,
  type TicketResponse,
} from "#/types";
import type { EventDetail, EventFilters, EventSummary } from "#/types/event";
import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "./eventKeys";

export interface MyTicketsFilters {
  searchTerm?: string;
  status?: AttendeeSimple["status"] | null;
}

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
    queryFn: async () =>
      await api
        .get<SingleResponse<EventDetail>>(`/v1/events/withSession/${eventId}`)
        .then((d) => d.data.data),
    staleTime: 30_000,
    enabled: !!eventId,
  });
}

export function useMyRegistration(eventId: number) {
  return useQuery({
    queryKey: eventKeys.myReg(eventId),
    queryFn: async () => {
      try {
        const { data } = await api.get<SingleResponse<AttendeeSimple>>(
          `/v1/events/${eventId}/attendees/me`,
        );
        return data.data;
      } catch (error: any) {
        if (error?.response?.status === 404) return null;
        throw error;
      }
    },
    enabled: !!eventId,
    retry: false,
  });
}

export function useMyTickets() {
  return useQuery({
    queryKey: eventKeys.myTickets(),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<TicketResponse>>(
        "/v1/users/me/tickets",
      );
      return data;
    },
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}
