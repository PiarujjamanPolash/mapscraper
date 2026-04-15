"use client";

import { useEffect, useState, useCallback } from "react";
import { ScrapingJob } from "@/types/job";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";

interface JobProgressProps {
  jobId: string;
  onComplete: () => void;
}

export function JobProgress({ jobId, onComplete }: JobProgressProps) {
  const [job, setJob] = useState<ScrapingJob | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (res.ok) {
        const data = await res.json();
        setJob(data.job);
        if (data.job.status === "completed" || data.job.status === "failed") {
          onComplete();
        }
      }
    } catch (error) {
      console.error("Error fetching job:", error);
    }
  }, [jobId, onComplete]);

  useEffect(() => {
    fetchJob();
    const interval = setInterval(fetchJob, 2000);
    return () => clearInterval(interval);
  }, [fetchJob]);

  if (!job) return null;

  const progressPercent =
    job.total > 0 ? Math.round((job.progress / job.total) * 100) : 0;

  const statusConfig = {
    pending: {
      icon: <Clock className="h-4 w-4" />,
      badge: <Badge variant="secondary">Pending</Badge>,
      color: "text-muted-foreground",
    },
    running: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      badge: <Badge variant="info">Running</Badge>,
      color: "text-blue-400",
    },
    completed: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      badge: <Badge variant="success">Completed</Badge>,
      color: "text-emerald-400",
    },
    failed: {
      icon: <XCircle className="h-4 w-4" />,
      badge: <Badge variant="destructive">Failed</Badge>,
      color: "text-red-400",
    },
  };

  const config = statusConfig[job.status];

  return (
    <Card className="glass-card border-white/5 animate-in overflow-hidden">
      {/* Animated top border */}
      {job.status === "running" && (
        <div className="h-0.5 bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 bg-[length:200%_100%] animate-shimmer" />
      )}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={config.color}>{config.icon}</div>
            <span className="font-medium text-sm">
              {job.keyword}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.city}, {job.radius}km
            </span>
          </div>
          <div className="flex items-center gap-2">
            {config.badge}
            <span className="text-sm font-semibold text-violet-400">
              {job.leads_found || 0} leads
            </span>
          </div>
        </div>

        {(job.status === "running" || job.status === "pending") && (
          <div className="space-y-2">
            <Progress value={progressPercent} />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Grid point {job.progress} of {job.total}
              </span>
              <span>{progressPercent}%</span>
            </div>
          </div>
        )}

        {job.status === "failed" && job.error && (
          <p className="text-sm text-red-400 mt-2">{job.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
