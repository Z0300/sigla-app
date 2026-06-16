import { EventStatus } from "#/types/event";

export const VALID_TRANSITIONS: Record<EventStatus, EventStatus[]> = {
  [EventStatus.draft]: [EventStatus.published, EventStatus.cancelled],
  [EventStatus.published]: [EventStatus.ongoing, EventStatus.cancelled],
  [EventStatus.ongoing]: [EventStatus.completed, EventStatus.cancelled],
  [EventStatus.completed]: [],
  [EventStatus.cancelled]: [],
};
