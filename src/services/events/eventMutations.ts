import { api } from "#/lib/axios";
import { type AttendeeSimple, type SingleResponse } from "#/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventKeys } from "./eventKeys";

export function useRegister(eventId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<SingleResponse<AttendeeSimple>>(
        `/v1/events/${eventId}/attendees/register`,
      );
      return data.data;
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
      const { data } = await api.delete<SingleResponse<AttendeeSimple>>(
        `/v1/events/${eventId}/attendees/${attendeeId}`,
      );
      return data.data;
    },
    onSuccess: () => {
      qc.removeQueries({ queryKey: eventKeys.myReg(eventId) });
      qc.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}
