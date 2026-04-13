export interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
}

export interface GooglePlaceDetails {
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
}

export async function searchPlaces(
  keyword: string,
  location: string
): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not defined");
  }

  // Use Text Search API by combining keyword and location
  const query = encodeURIComponent(`${keyword} in ${location}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Google Places API error: ${res.statusText}`);
  }

  const data = await res.json();
  return data.results || [];
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetails | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not defined");
  }

  const fields = "formatted_phone_number,website,rating,user_ratings_total";
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`;

  const res = await fetch(url);
  if (!res.ok) return null;

  const data = await res.json();
  return data.result || null;
}
