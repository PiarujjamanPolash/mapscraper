"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

interface ExportButtonProps {
  jobId: string;
  leadsCount: number;
}

export function ExportButton({ jobId, leadsCount }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "xlsx" | "csv") => {
    setLoading(true);
    try {
      const response = await fetch(`/api/export?jobId=${jobId}&format=${format}`);
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `leads-${jobId.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        id="export-xlsx-button"
        variant="outline"
        size="sm"
        onClick={() => handleExport("xlsx")}
        disabled={loading || leadsCount === 0}
        className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4 mr-2" />
        )}
        XLSX
      </Button>
      <Button
        id="export-csv-button"
        variant="outline"
        size="sm"
        onClick={() => handleExport("csv")}
        disabled={loading || leadsCount === 0}
        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
      >
        <Download className="h-4 w-4 mr-2" />
        CSV
      </Button>
    </div>
  );
}
