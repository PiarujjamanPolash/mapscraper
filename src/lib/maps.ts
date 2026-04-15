import axios from "axios";
import { delay } from "./utils";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const BASE_URL = "https://maps.googleapis.com/maps/api";

export interface GeocodingResult {
  lat: number;
  lng: number;
  formatted_address: string;
}

export interface PlaceResult {
  place_id: string;
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  business_status?: string;
  opening_hours?: {
    open_now?: boolean;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  url?: string; // Google Maps URL
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
}

/**
 * Geocode a location string to lat/lng coordinates
 */
export async function geocodeLocation(
  query: string
): Promise<GeocodingResult | null> {
  try {
    const response = await axios.get(`${BASE_URL}/geocode/json`, {
      params: {
        address: query,
        key: API_KEY,
      },
    });

    if (
      response.data.status === "OK" &&
      response.data.results &&
      response.data.results.length > 0
    ) {
      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    }
    console.error("Geocoding failed:", response.data.status);
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Search for nearby places using keyword
 */
export async function nearbySearch(params: {
  lat: number;
  lng: number;
  radius: number; // meters
  keyword: string;
  pageToken?: string;
}): Promise<{ results: PlaceResult[]; nextPageToken?: string }> {
  try {
    const requestParams: Record<string, string | number> = {
      location: `${params.lat},${params.lng}`,
      radius: params.radius,
      keyword: params.keyword,
      key: API_KEY!,
    };

    if (params.pageToken) {
      requestParams.pagetoken = params.pageToken;
    }

    const response = await axios.get(
      `${BASE_URL}/place/nearbysearch/json`,
      { params: requestParams }
    );

    return {
      results: response.data.results || [],
      nextPageToken: response.data.next_page_token,
    };
  } catch (error) {
    console.error("Nearby search error:", error);
    return { results: [] };
  }
}

/**
 * Get detailed place information (phone, website, etc.)
 */
export async function getPlaceDetails(
  placeId: string
): Promise<PlaceDetails | null> {
  try {
    const response = await axios.get(
      `${BASE_URL}/place/details/json`,
      {
        params: {
          place_id: placeId,
          fields:
            "place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,url,rating,user_ratings_total,types",
          key: API_KEY,
        },
      }
    );

    if (response.data.status === "OK" && response.data.result) {
      return response.data.result;
    }
    return null;
  } catch (error) {
    console.error("Place details error:", error);
    return null;
  }
}

/**
 * Fetch all pages for a nearby search (handles pagination)
 */
export async function nearbySearchAllPages(params: {
  lat: number;
  lng: number;
  radius: number;
  keyword: string;
  maxResults?: number;
}): Promise<PlaceResult[]> {
  const allResults: PlaceResult[] = [];
  let nextPageToken: string | undefined;
  const maxResults = params.maxResults || 60;

  // First page
  const firstPage = await nearbySearch(params);
  allResults.push(...firstPage.results);
  nextPageToken = firstPage.nextPageToken;

  // Subsequent pages (Google requires 2s delay before using next_page_token)
  while (nextPageToken && allResults.length < maxResults) {
    await delay(2000); // Required by Google Places API
    const nextPage = await nearbySearch({
      ...params,
      pageToken: nextPageToken,
    });
    allResults.push(...nextPage.results);
    nextPageToken = nextPage.nextPageToken;
  }

  return allResults.slice(0, maxResults);
}
