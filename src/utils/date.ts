import { format, isValid } from "date-fns";

export function safeFormat(
  dateStr: string | null | undefined,
  fmt: string,
): string {
  if (!dateStr) return "—";

  const date = new Date(dateStr);

  return isValid(date) ? format(date, fmt) : "—";
}
