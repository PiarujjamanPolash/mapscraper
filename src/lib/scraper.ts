import { getAdminFirestore } from "./firebase-admin";
import {
  geocodeLocation,
  nearbySearchAllPages,
  getPlaceDetails,
  PlaceResult,
} from "./maps";
import { generateGrid, getSearchRadiusMeters } from "./grid";
import { haversineDistance, calculateLeadScore, delay } from "./utils";
import { extractEmails } from "./email-extractor";
import { Lead } from "@/types/lead";
import { ScrapingJob } from "@/types/job";

interface ScrapeParams {
  jobId: string;
  keyword: string;
  niche: string;
  industry: string;
  country: string;
  region: string;
  city: string;
  radiusKm: number;
  maxResults: number;
  extractEmailsEnabled: boolean;
  userId: string;
}

/**
 * Main scraping orchestrator
 * Runs the full pipeline: geocode → grid → search → details → filter → store
 */
export async function scrapeLeads(params: ScrapeParams): Promise<void> {
  const db = getAdminFirestore();
  const jobRef = db.collection("jobs").doc(params.jobId);

  try {
    // Update job status to running
    await jobRef.update({
      status: "running",
      progress: 0,
    });

    // Step 1: Geocode location
    const locationQuery = [params.city, params.region, params.country]
      .filter(Boolean)
      .join(", ");

    const geo = await geocodeLocation(locationQuery);
    if (!geo) {
      await jobRef.update({
        status: "failed",
        error: `Could not geocode location: ${locationQuery}`,
      });
      return;
    }

    console.log(`Geocoded "${locationQuery}" → ${geo.lat}, ${geo.lng}`);

    // Step 2: Generate grid points
    const stepKm = params.radiusKm <= 10 ? 3 : params.radiusKm <= 50 ? 5 : 8;
    const gridPoints = generateGrid(geo.lat, geo.lng, params.radiusKm, stepKm);
    const searchRadius = getSearchRadiusMeters(stepKm);

    console.log(
      `Generated ${gridPoints.length} grid points (step: ${stepKm}km, radius: ${searchRadius}m)`
    );

    await jobRef.update({
      total: gridPoints.length,
      progress: 0,
    });

    // Step 3: Search each grid point
    const seenPlaceIds = new Set<string>();
    const allPlaces: PlaceResult[] = [];

    for (let i = 0; i < gridPoints.length; i++) {
      const point = gridPoints[i];

      try {
        const results = await nearbySearchAllPages({
          lat: point.lat,
          lng: point.lng,
          radius: searchRadius,
          keyword: params.keyword,
          maxResults: 60, // Per grid point max
        });

        // Deduplicate by place_id
        for (const place of results) {
          if (!seenPlaceIds.has(place.place_id)) {
            seenPlaceIds.add(place.place_id);
            allPlaces.push(place);
          }
        }

        // Update progress
        await jobRef.update({
          progress: i + 1,
          leads_found: allPlaces.length,
        });

        // Rate limit: wait between grid point searches
        if (i < gridPoints.length - 1) {
          await delay(1500);
        }
      } catch (error) {
        console.error(`Error searching grid point ${i}:`, error);
        continue;
      }

      // Check if we've hit max results
      if (allPlaces.length >= params.maxResults) {
        break;
      }
    }

    console.log(`Found ${allPlaces.length} unique places, fetching details...`);

    // Step 4: Get details + geo filter + store leads
    const leads: Lead[] = [];
    const limitedPlaces = allPlaces.slice(0, params.maxResults);

    for (let i = 0; i < limitedPlaces.length; i++) {
      const place = limitedPlaces[i];

      try {
        // Strict geo filter: check if within radius using haversine
        const distance = haversineDistance(
          geo.lat,
          geo.lng,
          place.geometry.location.lat,
          place.geometry.location.lng
        );

        if (distance > params.radiusKm) {
          console.log(
            `Skipping ${place.name} — ${distance.toFixed(1)}km away (outside ${params.radiusKm}km radius)`
          );
          continue;
        }

        // Get place details for phone, website, etc.
        const details = await getPlaceDetails(place.place_id);
        await delay(300); // Rate limit for details API

        // Extract emails if enabled
        let email = "";
        if (params.extractEmailsEnabled && details?.website) {
          try {
            const emails = await extractEmails(details.website);
            email = emails[0] || "";
          } catch {
            // Skip email extraction errors
          }
        }

        const lead: Lead = {
          id: place.place_id,
          business_name: details?.name || place.name,
          address: details?.formatted_address || place.vicinity || "",
          phone:
            details?.international_phone_number ||
            details?.formatted_phone_number ||
            "",
          email,
          website: details?.website || "",
          rating: details?.rating || place.rating || 0,
          reviews: details?.user_ratings_total || place.user_ratings_total || 0,
          keyword: params.keyword,
          niche: params.niche,
          industry: params.industry,
          city: params.city,
          region: params.region,
          country: params.country,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          google_maps_url:
            details?.url ||
            `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
          place_id: place.place_id,
          lead_score: 0,
          created_at: new Date().toISOString(),
          job_id: params.jobId,
        };

        // Calculate lead score
        lead.lead_score = calculateLeadScore({
          website: lead.website,
          rating: lead.rating,
          reviews: lead.reviews,
          phone: lead.phone,
          email: lead.email,
        });

        leads.push(lead);

        // Store each lead in Firestore
        await db.collection("leads").doc(lead.id).set(lead);

        // Update job progress
        if (i % 5 === 0) {
          await jobRef.update({
            leads_found: leads.length,
          });
        }
      } catch (error) {
        console.error(`Error processing place ${place.name}:`, error);
        continue;
      }
    }

    // Step 5: Mark job as completed
    await jobRef.update({
      status: "completed",
      leads_found: leads.length,
      progress: gridPoints.length,
      completed_at: new Date().toISOString(),
    });

    console.log(
      `Scraping completed: ${leads.length} leads stored for job ${params.jobId}`
    );
  } catch (error) {
    console.error("Scraping failed:", error);
    await jobRef.update({
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
