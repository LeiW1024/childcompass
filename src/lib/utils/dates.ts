// lib/utils/dates.ts
import { format, formatDistanceToNow, differenceInMonths } from "date-fns";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatRelative(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function childAgeInMonths(dob: Date | string): number {
  return differenceInMonths(new Date(), new Date(dob));
}

export function childAgeLabel(dob: Date | string): string {
  const months = childAgeInMonths(dob);
  if (months < 24) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
}
