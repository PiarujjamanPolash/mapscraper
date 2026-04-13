"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Lead } from "@/types/lead";

export default function SearchPage() {
  const [industry, setIndustry] = useState("");
  const [niche, setNiche] = useState("");
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState("5000");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [liveLeads, setLiveLeads] = useState<Lead[]>([]);
  const [isStreamDone, setIsStreamDone] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      setLiveLeads([]);
      setIsStreamDone(false);

      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, niche, keyword, country, region, city, radius: parseInt(radius) }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Error processing response' }));
        throw new Error(errorData.error || "Something went wrong.");
      }

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Read chunks from the stream
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          setIsStreamDone(true);
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        
        // Split by newline since the API streams NDJSON
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.type === "lead") {
              setLiveLeads(prev => [...prev, parsed.data]);
            } else if (parsed.type === "done") {
              setIsStreamDone(true);
            }
          } catch (e) {
            console.error("Error parsing stream chunk", e);
          }
        }
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto mt-12 mb-24">
        <Card>
          <CardHeader>
            <CardTitle>Find New Leads (Advanced Search)</CardTitle>
            <CardDescription>
              Target highly specific niches and locations to discover local businesses.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSearch}>
            <CardContent className="space-y-4">
              {error && <div className="text-destructive text-sm font-medium">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Input placeholder="e.g. estéticista, salón de belleza" value={industry} onChange={(e) => setIndustry(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Niche</label>
                  <Input placeholder="e.g. esteticista" value={niche} onChange={(e) => setNiche(e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium">Specific Keyword (required)</label>
                  <Input placeholder="e.g. esteticista" value={keyword} onChange={(e) => setKeyword(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Country (required)</label>
                  <Input placeholder="e.g. Spain" value={country} onChange={(e) => setCountry(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Region / State</label>
                  <Input placeholder="e.g. Andalucía" value={region} onChange={(e) => setRegion(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City (required)</label>
                  <Input placeholder="e.g. Málaga" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Radius (meters)</label>
                  <Input type="number" placeholder="5000" value={radius} onChange={(e) => setRadius(e.target.value)} />
                </div>
              </div>

            </CardContent>
          <CardFooter className="flex-col items-stretch space-y-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Searching & Loading Live..." : "Find Leads Live"}
            </Button>
            {isStreamDone && (
               <Button type="button" variant="outline" onClick={() => router.push("/dashboard")} className="w-full">
                 Go to Dashboard
               </Button>
            )}
          </CardFooter>
        </form>
      </Card>

      {(liveLeads.length > 0 || loading) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Live Search Results</CardTitle>
            <CardDescription>
              {loading ? "Fetching and scoring leads in real-time..." : `Found ${liveLeads.length} leads.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Website</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {liveLeads.map((lead, idx) => (
                  <TableRow key={lead.id || idx} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <TableCell className="font-medium">
                      {lead.name}
                      {lead.phone && <div className="text-xs text-muted-foreground mt-1">{lead.phone}</div>}
                    </TableCell>
                    <TableCell>{lead.rating ?? "N/A"}</TableCell>
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
                ))}
                {loading && (
                   <TableRow>
                     <TableCell colSpan={4} className="h-24 text-center">
                       <span className="animate-pulse">Loading next lead...</span>
                     </TableCell>
                   </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

    </div>
  </ProtectedRoute>
);
}
