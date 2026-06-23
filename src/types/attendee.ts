import type { EventStatus } from "./event";

export interface AttendeeSimple {
  id: number;
  eventId: number;
  eventTitle: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  status: "registered" | "checked_in" | "cancelled" | "no_show";
  qrToken: string | null;
  registeredAt: string;
}

export interface TicketResponse {
  attendeeId: number;
  eventId: number;
  eventTitle: string;
  eventVenue: string;
  eventStatus: EventStatus;
  eventStartDate: string;
  eventEndDate: string;
  attendeeStatus: "registered" | "checked_in" | "cancelled" | "no_show";
  registeredAt: string;
}
