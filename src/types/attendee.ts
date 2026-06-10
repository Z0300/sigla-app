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
