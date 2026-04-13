import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase-admin";

export async function GET() {
  try {
    const db = getDb();
    const snapshot = await db
      .collection("leads")
      .orderBy("createdAt", "desc")
      .get();

    const headers = ["name", "phone", "website", "rating", "reviews", "score"];

    const rows = snapshot.docs.map((doc) => {
      const lead = doc.data();
      const name = lead.name ? `"${String(lead.name).replace(/"/g, '""')}"` : "";
      const phone = lead.phone || "";
      const website = lead.website || "";
      const rating = lead.rating != null ? lead.rating : "";
      const reviews = lead.reviewCount != null ? lead.reviewCount : "";
      const score = lead.score != null ? lead.score : "";

      return [name, phone, website, rating, reviews, score].join(",");
    });

    const csvStr = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csvStr, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="leads.csv"',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Export error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
