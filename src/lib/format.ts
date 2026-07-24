import { clsx, type ClassValue } from "clsx";
import type { Profile } from "../types";

export function cn(...values: ClassValue[]) {
  return clsx(values);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function getProfileUrl(slug: string) {
  const origin = typeof window === "undefined" ? "https://tapyfi.com" : window.location.origin;
  return `${origin}/profile/${slug.replace(/^@/, "")}`;
}

export function getStableProfileUrl(profile: Pick<Profile, "id">) {
  const origin = typeof window === "undefined" ? "https://tapyfi.com" : window.location.origin;
  return `${origin}/p/${profile.id}`;
}

export function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
