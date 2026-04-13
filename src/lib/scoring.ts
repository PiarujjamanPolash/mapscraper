import type { Lead } from "@/types/lead";

/**
 * Calculates a lead score based on missing or weak features.
 * Returns a score between 0 and 100.
 */
export function scoreLead(lead: Partial<Lead>): number {
  let score = 100;

  if (!lead.website) score -= 30;
  if (!lead.reviewCount || lead.reviewCount < 20) score -= 20;
  if (!lead.rating || lead.rating < 4) score -= 20;
  if (!lead.phone) score -= 10;

  return Math.max(score, 0);
}
