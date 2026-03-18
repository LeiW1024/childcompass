// types/index.ts — ChildCompass MVP domain types

export type { Database } from "./supabase";

export type UserRole = "PARENT" | "PROVIDER" | "ADMIN";

export type ListingCategory =
  | "DAYCARE" | "PLAYGROUP" | "SPORTS" | "ARTS_CRAFTS"
  | "MUSIC" | "LANGUAGE" | "SWIMMING" | "NATURE" | "EDUCATION" | "OTHER";

export type PricePer = "SESSION" | "MONTH" | "WEEK" | "YEAR";

export type BookingStatus = "REQUESTED" | "CONFIRMED" | "DECLINED" | "CANCELLED";

export const CATEGORY_LABELS: Record<ListingCategory, string> = {
  DAYCARE:    "Daycare",
  PLAYGROUP:  "Playgroup",
  SPORTS:     "Sports",
  ARTS_CRAFTS:"Arts & Crafts",
  MUSIC:      "Music",
  LANGUAGE:   "Language",
  SWIMMING:   "Swimming",
  NATURE:     "Nature",
  EDUCATION:  "Education",
  OTHER:      "Other",
};

export const CATEGORY_ICONS: Record<ListingCategory, string> = {
  DAYCARE:    "🏫",
  PLAYGROUP:  "🧸",
  SPORTS:     "⚽",
  ARTS_CRAFTS:"🎨",
  MUSIC:      "🎵",
  LANGUAGE:   "🗣️",
  SWIMMING:   "🏊",
  NATURE:     "🌿",
  EDUCATION:  "📚",
  OTHER:      "✨",
};


export const CATEGORY_COLORS: Record<ListingCategory, string> = {
  DAYCARE:    "#3b82f6",  // blue
  PLAYGROUP:  "#f59e0b",  // amber
  SPORTS:     "#10b981",  // emerald
  ARTS_CRAFTS:"#8b5cf6",  // violet
  MUSIC:      "#ec4899",  // pink
  LANGUAGE:   "#06b6d4",  // cyan
  SWIMMING:   "#0ea5e9",  // sky
  NATURE:     "#22c55e",  // green
  EDUCATION:  "#f97316",  // orange
  OTHER:      "#6b7280",  // gray
};

export const CATEGORY_BG: Record<ListingCategory, string> = {
  DAYCARE:    "#eff6ff",
  PLAYGROUP:  "#fffbeb",
  SPORTS:     "#f0fdf4",
  ARTS_CRAFTS:"#f5f3ff",
  MUSIC:      "#fdf2f8",
  LANGUAGE:   "#ecfeff",
  SWIMMING:   "#f0f9ff",
  NATURE:     "#f0fdf4",
  EDUCATION:  "#fff7ed",
  OTHER:      "#f9fafb",
};

export const PRICE_PER_LABELS: Record<PricePer, string> = {
  SESSION: "per session",
  MONTH:   "per month",
  WEEK:    "per week",
  YEAR:    "per year",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  REQUESTED: "Requested",
  CONFIRMED: "Confirmed",
  DECLINED:  "Declined",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  REQUESTED: "card-sunshine",
  CONFIRMED: "card-mint",
  DECLINED:  "card-coral",
  CANCELLED: "card-lavender",
};

// Utility: format age range in months → human readable
export function formatAgeRange(minMonths: number, maxMonths: number): string {
  const fmt = (m: number) => m < 12 ? `${m}mo` : `${Math.floor(m / 12)}y`;
  return `${fmt(minMonths)} – ${fmt(maxMonths)}`;
}

export interface ApiSuccess<T> { data: T; error: null; }
export interface ApiError     { data: null; error: { message: string; code?: string }; }
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
