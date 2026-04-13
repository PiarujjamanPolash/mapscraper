import { NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails } from "@/lib/google";
import { scoreLead } from "@/lib/scoring";
import { getDb } from "@/lib/firebase-admin";

export async function POST(req: Request) {
  try {
    const { keyword, location } = await req.json();

    if (!keyword || !location) {
      return NextResponse.json(
        { error: "Missing keyword or location" },
        { status: 400 }
      );
    }

    // 1. Search places via Google Places API
    const places = await searchPlaces(keyword, location);

    // 2. Fetch details concurrently
    const detailedPlaces = await Promise.all(
      places.map(async (place) => {
        const details = await getPlaceDetails(place.place_id);
        return { place, details };
      })
    );

    const savedLeads = [];
    const db = getDb();
    const leadsCollection = db.collection("leads");

    // 3. Score and upsert into Firestore (doc ID = placeId for deduplication)
    for (const { place, details } of detailedPlaces) {
      const lat = place.geometry?.location.lat ?? null;
      const lng = place.geometry?.location.lng ?? null;

      const placeData = {
        name: place.name,
        placeId: place.place_id,
        address: place.formatted_address,
        lat,
        lng,
        phone: details?.formatted_phone_number ?? null,
        website: details?.website ?? null,
        rating: details?.rating ?? place.rating ?? null,
        reviewCount: details?.user_ratings_total ?? place.user_ratings_total ?? null,
      };

      const score = scoreLead(placeData);

      const docRef = leadsCollection.doc(place.place_id);
      await docRef.set(
        {
          ...placeData,
          score,
          createdAt: new Date().toISOString(),
        },
        { merge: true }
      );

      savedLeads.push({ id: place.place_id, ...placeData, score });
    }

    return NextResponse.json({
      success: true,
      count: savedLeads.length,
      leads: savedLeads,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Search error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
