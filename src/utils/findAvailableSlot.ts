export interface DaySlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function isSlotConflicting(
  slot: DaySlot,
  bookedSlots: DaySlot[],
): boolean {
  if (!slot.start || !slot.end) return false;
  const s = toMinutes(slot.start);
  const e = toMinutes(slot.end);
  return bookedSlots.some((b) => {
    const bs = toMinutes(b.start);
    const be = toMinutes(b.end);
    return s < be && e > bs;
  });
}

export function findConflictingSession<
  T extends { startTime: string; endTime: string; title: string },
>(slot: DaySlot, bookedSlots: (DaySlot & { ref: T })[]): T | null {
  if (!slot.start || !slot.end) return null;
  const s = toMinutes(slot.start);
  const e = toMinutes(slot.end);
  const hit = bookedSlots.find((b) => {
    const bs = toMinutes(b.start);
    const be = toMinutes(b.end);
    return s < be && e > bs;
  });
  return hit?.ref ?? null;
}

export function suggestAvailableSlots({
  bookedSlots,
  durationMinutes = 60,
  dayStartMinutes = 9 * 60,
  dayEndMinutes = 18 * 60,
  count = 3,
}: {
  bookedSlots: DaySlot[];
  durationMinutes?: number;
  dayStartMinutes?: number;
  dayEndMinutes?: number;
  count?: number;
}): DaySlot[] {
  const busy = bookedSlots
    .map((s) => ({ start: toMinutes(s.start), end: toMinutes(s.end) }))
    .sort((a, b) => a.start - b.start);

  const results: DaySlot[] = [];
  let cursor = dayStartMinutes;

  for (const slot of busy) {
    while (slot.start - cursor >= durationMinutes && results.length < count) {
      results.push({
        start: toHHMM(cursor),
        end: toHHMM(cursor + durationMinutes),
      });
      cursor += durationMinutes;
    }
    if (slot.end > cursor) cursor = slot.end;
    if (results.length >= count) break;
  }

  while (results.length < count && dayEndMinutes - cursor >= durationMinutes) {
    results.push({
      start: toHHMM(cursor),
      end: toHHMM(cursor + durationMinutes),
    });
    cursor += durationMinutes;
  }

  return results;
}
