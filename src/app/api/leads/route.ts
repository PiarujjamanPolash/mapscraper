import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { Lead } from "@/types/lead";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "lead_score";
    const sortDir = searchParams.get("sortDir") || "desc";
    const userId = searchParams.get("userId") || "";

    const db = getAdminFirestore();

    let query = db.collection("leads") as FirebaseFirestore.Query;

    if (jobId) {
      query = query.where("job_id", "==", jobId);
    }

    // Sort
    if (sortBy === "rating" || sortBy === "reviews" || sortBy === "lead_score") {
      query = query.orderBy(sortBy, sortDir === "asc" ? "asc" : "desc");
    } else {
      query = query.orderBy("lead_score", "desc");
    }

    const snapshot = await query.get();
    let leads: Lead[] = snapshot.docs.map((doc) => doc.data() as Lead);

    // Client-side search filter (Firestore doesn't support full-text search)
    if (search) {
      const q = search.toLowerCase();
      leads = leads.filter(
        (lead) =>
          lead.business_name?.toLowerCase().includes(q) ||
          lead.address?.toLowerCase().includes(q) ||
          lead.phone?.includes(q) ||
          lead.email?.toLowerCase().includes(q)
      );
    }

    const total = leads.length;
    const paginated = leads.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      leads: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
