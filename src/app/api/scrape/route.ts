import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { scrapeLeads } from "@/lib/scraper";

export const maxDuration = 300; // 5 min for Vercel Pro, adjust as needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      industry,
      niche,
      keyword,
      country,
      region,
      city,
      radius,
      maxResults,
      extractEmails,
      userId,
    } = body;

    // Validate required fields
    if (!keyword || !city) {
      return NextResponse.json(
        { error: "keyword and city are required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();

    // Create job document
    const jobRef = db.collection("jobs").doc();
    const jobData = {
      id: jobRef.id,
      status: "pending" as const,
      progress: 0,
      total: 0,
      leads_found: 0,
      keyword,
      niche: niche || "",
      industry: industry || "",
      city,
      region: region || "",
      country: country || "",
      radius: radius || 50,
      max_results: maxResults || 200,
      created_at: new Date().toISOString(),
      user_id: userId || "anonymous",
    };

    await jobRef.set(jobData);

    // Start scraping in background (fire-and-forget)
    // The scraper will update the job status in Firestore as it progresses
    scrapeLeads({
      jobId: jobRef.id,
      keyword,
      niche: niche || "",
      industry: industry || "",
      country: country || "",
      region: region || "",
      city,
      radiusKm: radius || 50,
      maxResults: maxResults || 200,
      extractEmailsEnabled: extractEmails || false,
      userId: userId || "anonymous",
    }).catch((error) => {
      console.error("Background scraping error:", error);
      // Update job status to failed
      jobRef.update({
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });

    return NextResponse.json({
      jobId: jobRef.id,
      message: "Scraping job started",
    });
  } catch (error) {
    console.error("Scrape API error:", error);
    return NextResponse.json(
      { error: "Failed to start scraping job" },
      { status: 500 }
    );
  }
}
