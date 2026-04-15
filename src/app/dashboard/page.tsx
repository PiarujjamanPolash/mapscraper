"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { SearchForm } from "@/components/SearchForm";
import { LeadTable } from "@/components/LeadTable";
import { ExportButton } from "@/components/ExportButton";
import { JobProgress } from "@/components/JobProgress";
import { JobHistory } from "@/components/JobHistory";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/lead";
import { ScrapingJob } from "@/types/job";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  BarChart3,
  Target,
  Star,
  TrendingUp,
  History,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Listen to jobs in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "jobs"),
      where("user_id", "==", user.uid),
      orderBy("created_at", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const jobsList: ScrapingJob[] = snapshot.docs.map(
        (doc) => doc.data() as ScrapingJob
      );
      setJobs(jobsList);

      // Auto-select most recent job if none selected
      if (!activeJobId && jobsList.length > 0) {
        setActiveJobId(jobsList[0].id);
      }
    });

    return () => unsub();
  }, [user, activeJobId]);

  // Fetch leads when active job changes
  const fetchLeads = useCallback(async (jobId: string) => {
    setLeadsLoading(true);
    try {
      const res = await fetch(`/api/leads?jobId=${jobId}&limit=1000`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeJobId) {
      fetchLeads(activeJobId);
    }
  }, [activeJobId, fetchLeads]);

  const handleSearch = async (params: {
    industry: string;
    niche: string;
    keyword: string;
    country: string;
    region: string;
    city: string;
    radius: number;
    maxResults: number;
    extractEmails: boolean;
  }) => {
    setIsSearching(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          userId: user?.uid,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRunningJobId(data.jobId);
        setActiveJobId(data.jobId);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleJobComplete = useCallback(() => {
    if (runningJobId) {
      fetchLeads(runningJobId);
      setRunningJobId(null);
    }
  }, [runningJobId, fetchLeads]);

  // Stats
  const activeJob = jobs.find((j) => j.id === activeJobId);
  const totalLeads = leads.length;
  const avgRating =
    totalLeads > 0
      ? (leads.reduce((sum, l) => sum + (l.rating || 0), 0) / totalLeads).toFixed(1)
      : "0";
  const highScoreLeads = leads.filter((l) => (l.lead_score || 0) >= 70).length;
  const withWebsite = leads.filter((l) => l.website).length;

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar — Job History */}
      <aside className="hidden lg:block w-72 border-r border-white/5 glass overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <h2 className="font-semibold flex items-center gap-2 text-sm">
            <History className="h-4 w-4 text-violet-400" />
            Scraping Jobs
          </h2>
        </div>
        <JobHistory
          jobs={jobs}
          activeJobId={activeJobId}
          onSelectJob={(id) => setActiveJobId(id)}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Search Form */}
          <SearchForm onSearch={handleSearch} isLoading={isSearching} />

          {/* Active job progress */}
          {runningJobId && (
            <JobProgress
              jobId={runningJobId}
              onComplete={handleJobComplete}
            />
          )}

          {/* Stats bar */}
          {totalLeads > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in">
              <div className="glass-card rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Total Leads
                </div>
                <p className="text-2xl font-bold">{totalLeads}</p>
              </div>
              <div className="glass-card rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  Avg Rating
                </div>
                <p className="text-2xl font-bold">{avgRating}</p>
              </div>
              <div className="glass-card rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                  High Score
                </div>
                <p className="text-2xl font-bold">{highScoreLeads}</p>
              </div>
              <div className="glass-card rounded-lg border border-white/5 p-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <Target className="h-3.5 w-3.5 text-violet-400" />
                  Has Website
                </div>
                <p className="text-2xl font-bold">{withWebsite}</p>
              </div>
            </div>
          )}

          {/* Lead Table + Export */}
          {activeJobId && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold">Results</h2>
                  {activeJob && (
                    <Badge variant="outline" className="text-xs">
                      {activeJob.keyword} — {activeJob.city}, {activeJob.radius}km
                    </Badge>
                  )}
                </div>
                <ExportButton jobId={activeJobId} leadsCount={totalLeads} />
              </div>

              <LeadTable leads={leads} loading={leadsLoading} />
            </div>
          )}

          {/* Empty state */}
          {!activeJobId && jobs.length === 0 && (
            <div className="glass-card rounded-lg border border-white/5 p-12 text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-600/20 to-cyan-500/20 mx-auto mb-4 flex items-center justify-center">
                <Target className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Finding Leads</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter an industry or niche, pick a city, and set your radius.
                We&apos;ll search the entire area using a grid strategy and find every
                business that matches.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
