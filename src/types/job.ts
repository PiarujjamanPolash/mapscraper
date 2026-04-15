export interface ScrapingJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  total: number;
  leads_found: number;
  keyword: string;
  niche: string;
  industry: string;
  city: string;
  region: string;
  country: string;
  radius: number;
  max_results: number;
  created_at: string;
  completed_at?: string;
  error?: string;
  user_id: string;
}
