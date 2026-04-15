import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const db = getAdminFirestore();
    const jobDoc = await db.collection("jobs").doc(params.jobId).get();

    if (!jobDoc.exists) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({ job: jobDoc.data() });
  } catch (error) {
    console.error("Get job error:", error);
    return NextResponse.json(
      { error: "Failed to fetch job" },
      { status: 500 }
    );
  }
}
