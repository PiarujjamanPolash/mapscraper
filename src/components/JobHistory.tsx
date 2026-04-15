"use client";

import { ScrapingJob } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface JobHistoryProps {
  jobs: ScrapingJob[];
  activeJobId: string | null;
  onSelectJob: (jobId: string) => void;
}

export function JobHistory({ jobs, activeJobId, onSelectJob }: JobHistoryProps) {
  if (jobs.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="h-12 w-12 rounded-full bg-secondary mx-auto mb-3 flex items-center justify-center">
          <Clock className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">No scraping jobs yet</p>
        <p className="text-xs text-muted-foreground mt-1">
          Run a search to get started
        </p>
      </div>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-1">
      {jobs.map((job) => (
        <button
          key={job.id}
          onClick={() => onSelectJob(job.id)}
          className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
            activeJobId === job.id
              ? "bg-violet-500/10 border border-violet-500/30"
              : "hover:bg-white/[0.03] border border-transparent"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="mt-0.5">{statusIcon(job.status)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{job.keyword}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{job.city}</span>
                <span>• {job.radius}km</span>
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge
                  variant={
                    job.status === "completed"
                      ? "success"
                      : job.status === "failed"
                      ? "destructive"
                      : job.status === "running"
                      ? "info"
                      : "secondary"
                  }
                  className="text-[10px] px-1.5 py-0"
                >
                  {job.leads_found || 0} leads
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(job.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
