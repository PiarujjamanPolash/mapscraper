export interface Lead {
  id: string;
  name: string;
  placeId: string;
  address: string;
  city?: string | null;
  country?: string | null;
  lat?: number | null;
  lng?: number | null;
  phone?: string | null;
  website?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  score?: number | null;
  createdAt: string; // ISO string (Firestore Timestamp converted)
}
