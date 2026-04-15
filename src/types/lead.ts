export interface Lead {
  id: string;
  business_name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviews: number;
  keyword: string;
  niche: string;
  industry: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  place_id: string;
  lead_score: number;
  created_at: string;
  job_id: string;
}

export interface LeadSearchParams {
  industry: string;
  niche: string;
  keyword: string;
  country: string;
  region: string;
  city: string;
  radius: number; // in km
  maxResults: number;
  extractEmails: boolean;
}
