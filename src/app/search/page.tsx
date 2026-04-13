"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState("5000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, location, radius: parseInt(radius) }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      // Redirect to dashboard on success
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      <Card>
        <CardHeader>
          <CardTitle>Find New Leads</CardTitle>
          <CardDescription>
            Enter a keyword and location to discover local businesses and score them based on their online presence.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSearch}>
          <CardContent className="space-y-4">
            {error && <div className="text-destructive text-sm font-medium">{error}</div>}
            <div className="space-y-2">
              <label htmlFor="keyword" className="text-sm font-medium">Keyword</label>
              <Input
                id="keyword"
                placeholder="e.g. Hotel, Dentist, Plumber"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">Location</label>
              <Input
                id="location"
                placeholder="e.g. Seychelles, Dubai"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="radius" className="text-sm font-medium">Radius (meters)</label>
              <Input
                id="radius"
                type="number"
                placeholder="5000"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Note: Radius is used when coordinates are resolved, otherwise location name takes precedence.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Searching & Scoring..." : "Find Leads"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
