/**
 * Grid generation utility for comprehensive area coverage.
 * Divides a circular search area into a grid of overlapping search points
 * to maximize coverage beyond single API call limits.
 */

interface GridPoint {
  lat: number;
  lng: number;
}

/**
 * Generate a grid of search points within a radius around a center point.
 * Uses hexagonal-style offset to ensure coverage.
 *
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusKm - Search radius in kilometers
 * @param stepKm - Distance between grid points in km (default: 5km)
 * @returns Array of lat/lng grid points
 */
export function generateGrid(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  stepKm: number = 5
): GridPoint[] {
  const points: GridPoint[] = [];

  // Always include center
  points.push({ lat: centerLat, lng: centerLng });

  if (radiusKm <= stepKm) {
    return points;
  }

  // Calculate number of steps from center
  const steps = Math.ceil(radiusKm / stepKm);

  // 1 degree latitude ≈ 111.32 km
  const latStep = stepKm / 111.32;

  // 1 degree longitude varies by latitude
  const lngStep = stepKm / (111.32 * Math.cos((centerLat * Math.PI) / 180));

  for (let i = -steps; i <= steps; i++) {
    for (let j = -steps; j <= steps; j++) {
      if (i === 0 && j === 0) continue; // Skip center (already added)

      const newLat = centerLat + i * latStep;
      const newLng = centerLng + j * lngStep;

      // Check if this point is within the radius
      const distFromCenter = haversineDistanceSimple(
        centerLat,
        centerLng,
        newLat,
        newLng
      );

      if (distFromCenter <= radiusKm) {
        points.push({ lat: newLat, lng: newLng });
      }
    }
  }

  return points;
}

/**
 * Simple haversine distance calculation
 */
function haversineDistanceSimple(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate search radius for each grid point (in meters).
 * Uses overlap factor to ensure no gaps between grid cells.
 */
export function getSearchRadiusMeters(stepKm: number): number {
  // Use 1.2x step to ensure overlap coverage
  return Math.round(stepKm * 1.2 * 1000);
}

/**
 * Estimate total API calls needed for a given search
 */
export function estimateApiCalls(radiusKm: number, stepKm: number = 5): number {
  const grid = generateGrid(0, 0, radiusKm, stepKm);
  // Each grid point = 1 nearby search + potential pagination (up to 3 pages)
  // + place details for each result
  return grid.length * 3; // Rough estimate
}
