import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const format = searchParams.get("format") || "xlsx";

    if (!jobId) {
      return NextResponse.json(
        { error: "jobId is required" },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const snapshot = await db
      .collection("leads")
      .where("job_id", "==", jobId)
      .orderBy("lead_score", "desc")
      .get();

    const leads = snapshot.docs.map((doc) => {
      const d = doc.data();
      return {
        "Business Name": d.business_name || "",
        "Phone": d.phone || "",
        "Email": d.email || "",
        "Website": d.website || "",
        "Address": d.address || "",
        "City": d.city || "",
        "Region": d.region || "",
        "Country": d.country || "",
        "Rating": d.rating || 0,
        "Reviews": d.reviews || 0,
        "Lead Score": d.lead_score || 0,
        "Google Maps URL": d.google_maps_url || "",
        "Latitude": d.latitude || 0,
        "Longitude": d.longitude || 0,
      };
    });

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(leads);

    // Set column widths
    ws["!cols"] = [
      { wch: 30 }, // Business Name
      { wch: 18 }, // Phone
      { wch: 30 }, // Email
      { wch: 35 }, // Website
      { wch: 40 }, // Address
      { wch: 15 }, // City
      { wch: 15 }, // Region
      { wch: 12 }, // Country
      { wch: 8 },  // Rating
      { wch: 10 }, // Reviews
      { wch: 10 }, // Lead Score
      { wch: 50 }, // Google Maps URL
      { wch: 12 }, // Latitude
      { wch: 12 }, // Longitude
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");

    if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(ws);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="leads-${jobId.slice(0, 8)}.csv"`,
        },
      });
    }

    // XLSX
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-${jobId.slice(0, 8)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export leads" },
      { status: 500 }
    );
  }
}
