import { api } from "#/lib/axios";
import type { AttendeeSimple } from "#/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "./eventKeys";

export function useRegister(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AttendeeSimple>(
        `/events/${eventId}/attendees/register`,
      );
      return data;
    },
    onSuccess: (attendee) => {
      qc.setQueryData(eventKeys.myReg(eventId), attendee);
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}

export function useCancelRegistration(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attendeeId: number) => {
      const { data } = await api.delete<AttendeeSimple>(
        `/events/${eventId}/attendees/${attendeeId}`,
      );
      return data;
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: eventKeys.myReg(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}
