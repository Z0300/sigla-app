import { format, isValid } from "date-fns";

export function safeFormat(
  dateStr: string | null | undefined,
  fmt: string,
): string {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  return isValid(date) ? format(date, fmt) : "—";
}

export function toLocalInput(iso?: string) {
  return iso?.slice(0, 16) ?? "";
}

export function dateToMin(date: string) {
  return `${date.slice(0, 10)}T00:00`;
}

export function dateToMax(date: string) {
  return `${date.slice(0, 10)}T23:59`;
}
export function fmtDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getEventDays(startDate: string, endDate: string) {
  const days: { label: string; date: string }[] = [];
  const start = new Date(startDate.slice(0, 10) + "T00:00");
  const end = new Date(endDate.slice(0, 10) + "T00:00");

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const iso = `${y}-${mo}-${day}`;

    days.push({
      date: iso,
      label: `Day ${days.length + 1} · ${d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`,
    });
  }

  return days;
}

export function splitDateTime(
  iso: string | undefined,
  days: { date: string }[],
) {
  if (!iso) return { dayIndex: 0, time: "" };
  const clean = iso.endsWith("Z") ? iso.slice(0, 19) : iso;
  const datePart = clean.slice(0, 10);
  const timePart = clean.slice(11, 16);
  const idx = days.findIndex((d) => d.date === datePart);
  return { dayIndex: idx >= 0 ? idx : 0, time: timePart };
}
