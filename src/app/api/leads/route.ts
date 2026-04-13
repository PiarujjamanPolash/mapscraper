import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const minScore = searchParams.get("minScore");
    const noWebsite = searchParams.get("noWebsite") === "true";
    const lowReviews = searchParams.get("lowReviews") === "true";

    const db = getDb();
    let query: FirebaseFirestore.Query = db.collection("leads").orderBy("createdAt", "desc");

    if (minScore) {
      query = query.where("score", ">=", parseInt(minScore));
    }
    if (noWebsite) {
      query = query.where("website", "==", null);
    }
    if (lowReviews) {
      query = query.where("reviewCount", "<", 20);
    }

    const snapshot = await query.get();

    const leads = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, count: leads.length, leads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Fetch leads error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
