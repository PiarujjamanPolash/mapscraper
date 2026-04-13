import { NextResponse } from "next/server";
import { searchPlaces, getPlaceDetails } from "@/lib/google";
import { scoreLead } from "@/lib/scoring";
import { getDb } from "@/lib/firebase-admin";

export const runtime = 'nodejs'; // or edge, depending on Firebase. But firebase-admin requires nodejs

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { industry, niche, keyword, country, region, city } = body;

    if (!keyword || !city || !country) {
      return NextResponse.json(
        { error: "Missing required fields: keyword, city, country" },
        { status: 400 }
      );
    }

    // Smart query combination
    const locationPart = [city, region, country].filter(Boolean).join(", ");
    const keywordPart = [industry, niche, keyword].filter(Boolean).join(" ");

    // 1. Initial Google Places Search
    const places = await searchPlaces(keywordPart, locationPart);

    if (!places.length) {
      return NextResponse.json(
        { success: true, count: 0, leads: [], message: "No places found" },
        { status: 200 }
      );
    }

    // Set up SSE Stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let savedCount = 0;
        const db = getDb();
        const leadsCollection = db.collection("leads");

        for (const place of places) {
          try {
            // Fetch Details
            const details = await getPlaceDetails(place.place_id);
            
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

            // Upsert Firebase
            const docRef = leadsCollection.doc(place.place_id);
            await docRef.set(
              {
                ...placeData,
                score,
                createdAt: new Date().toISOString(),
              },
              { merge: true }
            );

            savedCount++;

            // Stream to client
            const leadRecord = { id: place.place_id, ...placeData, score };
            const payload = JSON.stringify({ type: "lead", data: leadRecord }) + "\n";
            controller.enqueue(encoder.encode(payload));

          } catch (error) {
            console.error(`Error processing place ${place.place_id}:`, error);
          }
        }

        // Notify client stream is complete
        const donePayload = JSON.stringify({ type: "done", count: savedCount }) + "\n";
        controller.enqueue(encoder.encode(donePayload));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Search API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
