import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Haversine distance between two lat/lng points in km
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Calculate lead score (0-100)
 */
export function calculateLeadScore(lead: {
  website?: string;
  rating?: number;
  reviews?: number;
  phone?: string;
  email?: string;
}): number {
  let score = 0;
  if (lead.website) score += 25;
  if (lead.rating && lead.rating >= 4) score += 25;
  if (lead.reviews && lead.reviews >= 50) score += 20;
  if (lead.phone) score += 15;
  if (lead.email) score += 15;
  return score;
}

/**
 * Delay helper for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
