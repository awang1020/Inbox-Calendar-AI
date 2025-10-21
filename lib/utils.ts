import { clsx } from "clsx";
import type { ClassValue } from "clsx";
import { format, isToday, isTomorrow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDeadline(date?: string) {
  if (!date) return "No deadline";
  const parsed = new Date(date);

  if (Number.isNaN(parsed.valueOf())) {
    return "No deadline";
  }

  if (isToday(parsed)) {
    return `Today • ${format(parsed, "p")}`;
  }

  if (isTomorrow(parsed)) {
    return `Tomorrow • ${format(parsed, "p")}`;
  }

  return format(parsed, "MMM d, yyyy p");
}
