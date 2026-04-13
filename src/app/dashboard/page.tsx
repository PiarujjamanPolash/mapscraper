"use client";

import { useState, useEffect, useCallback } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Lead } from "@/types/lead";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [minScore, setMinScore] = useState("");
  const [noWebsite, setNoWebsite] = useState(false);
  const [lowReviews, setLowReviews] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (minScore) params.append("minScore", minScore);
      if (noWebsite) params.append("noWebsite", "true");
      if (lowReviews) params.append("lowReviews", "true");

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [minScore, noWebsite, lowReviews]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Database</h1>
          <p className="text-muted-foreground">Manage and filter your scraped leads.</p>
        </div>
        <Button asChild variant="outline">
          <a href="/api/export" download>Export to CSV</a>
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-4 p-4 border rounded-md bg-muted/20">
        <div className="space-y-1">
          <label className="text-sm font-medium">Min Score</label>
          <Input 
            type="number" 
            placeholder="e.g. 50" 
            value={minScore} 
            onChange={e => setMinScore(e.target.value)} 
            className="w-32 bg-background"
          />
        </div>
        <div className="flex items-center space-x-2 pb-2">
          <input 
            type="checkbox" 
            id="nowebsite" 
            checked={noWebsite}
            onChange={e => setNoWebsite(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="nowebsite" className="text-sm font-medium">No Website</label>
        </div>
        <div className="flex items-center space-x-2 pb-2">
          <input 
            type="checkbox" 
            id="lowreviews" 
            checked={lowReviews}
            onChange={e => setLowReviews(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="lowreviews" className="text-sm font-medium">Low Reviews (&lt;20)</label>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Reviews</TableHead>
              <TableHead>Website</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No leads found.</TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">
                    {lead.name}
                    {lead.phone && <div className="text-xs text-muted-foreground mt-1">{lead.phone}</div>}
                  </TableCell>
                  <TableCell>{lead.rating ?? "N/A"}</TableCell>
                  <TableCell>{lead.reviewCount ?? "N/A"}</TableCell>
                  <TableCell>
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        Visit
                      </a>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant={lead.score && lead.score > 70 ? "default" : "secondary"}>
                      {lead.score ?? 0}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </div>
    </ProtectedRoute>
  );
}
