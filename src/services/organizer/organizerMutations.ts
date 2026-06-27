import { api } from "#/lib/axios";
import type { PaginatedResponse, SingleResponse } from "#/types";
import type {
  EventFormValues,
  EventStatus,
  OrganizerAttendee,
  OrganizerEvent,
  OrganizerSession,
  SessionFormValues,
} from "#/types/event";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "./organizerKeys";
import { toast } from "sonner";

export function useUpdateEventStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      eventId,
      status,
    }: {
      eventId: number;
      status: EventStatus;
    }) =>
      await api
        .patch<
          SingleResponse<OrganizerEvent>
        >(`/v1/events/${eventId}/${status}`)
        .then((d) => d.data.data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: eventKeys.organizerAll() });
      toast.success(`Event status updated to ${variables.status}`);
    },
    onError: () => {
      toast.error("Failed to update event status");
    },
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { data } = await api.post<SingleResponse<OrganizerEvent>>(
        "/v1/events",
        values,
      );
      return data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: eventKeys.organizerAll() }),
  });
}

export function useUpdateEvent(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<EventFormValues>) => {
      const { data } = await api.patch<SingleResponse<OrganizerEvent>>(
        `/v1/events/${eventId}`,
        values,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: eventKeys.organizerAll() });
      toast.success("Event updated successfully");
    },
    onError: () => {
      toast.error("Failed to update event");
    },
  });
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export function useOrganizerSessions(eventId: number) {
  return useQuery({
    queryKey: eventKeys.organizerSessions(eventId),
    queryFn: async () => {
      const { data } = await api.get<SingleResponse<OrganizerSession[]>>(
        `/v1/events/${eventId}/sessions`,
      );
      return data.data;
    },
    enabled: !!eventId,
  });
}

export function useCreateSession(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: SessionFormValues) => {
      const { data } = await api.post<SingleResponse<OrganizerSession>>(
        `/v1/events/${eventId}/sessions`,
        values,
      );
      return data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: eventKeys.organizerSessions(eventId) }),
  });
}

export function useUpdateSession(eventId: number, sessionId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Partial<SessionFormValues>) => {
      const { data } = await api.patch<SingleResponse<OrganizerSession>>(
        `/v1/events/${eventId}/sessions/${sessionId}`,
        values,
      );
      return data.data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: eventKeys.organizerSessions(eventId) }),
  });
}

export function useDeleteSession(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: number) => {
      await api.delete(`/events/${eventId}/sessions/${sessionId}`);
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: eventKeys.organizerSessions(eventId) }),
  });
}

// ─── Attendees ────────────────────────────────────────────────────────────────

export function useOrganizerAttendees(eventId: number, status?: string | null) {
  return useQuery({
    queryKey: eventKeys.organizerAttendees(eventId, status),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<OrganizerAttendee>>(
        `/v1/events/${eventId}/attendees`,
      );
      return data;
    },
    enabled: !!eventId,
  });
}
