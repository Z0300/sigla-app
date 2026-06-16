import z from "zod";

export const EventSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required"),
  description: z.string(),
  venue: z.string().min(1, "Venue is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

export type CreateEventInput = z.infer<typeof EventSchema>;

export const SessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  room: z.string(),
  dayIndex: z.number().min(0),
  startTimeOnly: z.string().min(1, "Required"),
  endTimeOnly: z.string().min(1, "Required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

export type CreateSessionInput = z.infer<typeof SessionSchema>;
