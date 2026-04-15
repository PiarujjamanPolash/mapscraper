"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  MapPin,
  Building2,
  Globe,
  Radius,
  Target,
  Mail,
  Loader2,
} from "lucide-react";

const INDUSTRIES = [
  "Beauty & Wellness",
  "Health & Medical",
  "Restaurant & Food",
  "Fitness & Gym",
  "Automotive",
  "Real Estate",
  "Legal Services",
  "Home Services",
  "Education",
  "Retail & Shopping",
  "Technology",
  "Financial Services",
  "Pet Services",
  "Photography",
  "Travel & Tourism",
  "Entertainment",
  "Construction",
  "Marketing & Advertising",
  "Other",
];

interface SearchFormProps {
  onSearch: (params: {
    industry: string;
    niche: string;
    keyword: string;
    country: string;
    region: string;
    city: string;
    radius: number;
    maxResults: number;
    extractEmails: boolean;
  }) => void;
  isLoading: boolean;
}

export function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [niche, setNiche] = useState("");
  const [keyword, setKeyword] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [radius, setRadius] = useState(50);
  const [maxResults, setMaxResults] = useState(200);
  const [extractEmails, setExtractEmails] = useState(false);
  const [keywordManuallyEdited, setKeywordManuallyEdited] = useState(false);

  // Auto-generate keyword from niche + industry
  useEffect(() => {
    if (!keywordManuallyEdited) {
      const parts = [niche, industry === "Other" ? customIndustry : industry].filter(
        Boolean
      );
      setKeyword(parts.join(" ").toLowerCase());
    }
  }, [niche, industry, customIndustry, keywordManuallyEdited]);

  const handleSubmit = () => {
    if (!keyword || !city) return;

    onSearch({
      industry: industry === "Other" ? customIndustry : industry,
      niche,
      keyword,
      country,
      region,
      city,
      radius,
      maxResults,
      extractEmails,
    });
  };

  return (
    <Card className="glass-card border-white/5 animate-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-cyan-500/20 border border-violet-500/20 flex items-center justify-center">
            <Search className="h-4 w-4 text-violet-400" />
          </div>
          Lead Search
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Industry */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              Industry
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry-select">
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {industry === "Other" && (
              <Input
                id="custom-industry"
                placeholder="Enter custom industry..."
                value={customIndustry}
                onChange={(e) => setCustomIndustry(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          {/* Niche */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5" />
              Niche
            </Label>
            <Input
              id="niche-input"
              placeholder="e.g., esthetician, dentist..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          {/* Keyword */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Search className="h-3.5 w-3.5" />
              Keyword
              <span className="text-xs text-violet-400">(auto-filled)</span>
            </Label>
            <Input
              id="keyword-input"
              placeholder="Search keyword..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setKeywordManuallyEdited(true);
              }}
              onBlur={() => {
                if (!keyword) setKeywordManuallyEdited(false);
              }}
            />
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" />
              Country
            </Label>
            <Input
              id="country-input"
              placeholder="e.g., Spain"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>

          {/* Region/State */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              Region / State
            </Label>
            <Input
              id="region-input"
              placeholder="e.g., Andalusia"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              City <span className="text-red-400">*</span>
            </Label>
            <Input
              id="city-input"
              placeholder="e.g., Málaga"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Radius */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Radius className="h-3.5 w-3.5" />
              Radius: <span className="text-violet-400 font-semibold">{radius} km</span>
            </Label>
            <input
              id="radius-slider"
              type="range"
              min={5}
              max={200}
              step={5}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-violet-500"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 km</span>
              <span>200 km</span>
            </div>
          </div>

          {/* Max Results */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              Max Results
            </Label>
            <Input
              id="max-results-input"
              type="number"
              min={10}
              max={2000}
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
            />
          </div>

          {/* Email Extraction Toggle */}
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email Extraction
            </Label>
            <button
              id="email-extraction-toggle"
              type="button"
              onClick={() => setExtractEmails(!extractEmails)}
              className={`relative inline-flex h-10 w-full items-center rounded-md border px-3 text-sm transition-all duration-200 ${
                extractEmails
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                  : "border-input bg-background text-muted-foreground"
              }`}
            >
              <div
                className={`mr-2 h-4 w-4 rounded-full border-2 transition-all ${
                  extractEmails
                    ? "border-violet-400 bg-violet-400"
                    : "border-muted-foreground"
                }`}
              >
                {extractEmails && (
                  <svg className="h-full w-full p-0.5 text-background" viewBox="0 0 12 12">
                    <path d="M3 6l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </div>
              {extractEmails ? "Enabled (slower)" : "Disabled"}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button
            id="find-leads-button"
            size="lg"
            onClick={handleSubmit}
            disabled={isLoading || !keyword || !city}
            className="min-w-[180px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Find Leads
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
