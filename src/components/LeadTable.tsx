"use client";

import { useState, useMemo } from "react";
import { Lead } from "@/types/lead";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Star,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
}

type SortField = "business_name" | "rating" | "reviews" | "lead_score";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 20;

export function LeadTable({ leads, loading }: LeadTableProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("lead_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [page, setPage] = useState(1);

  // Filter
  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.business_name?.toLowerCase().includes(q) ||
        lead.address?.toLowerCase().includes(q) ||
        lead.phone?.includes(q) ||
        lead.email?.toLowerCase().includes(q)
    );
  }, [leads, search]);

  // Sort
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = a[sortField] ?? 0;
      const bVal = b[sortField] ?? 0;
      if (sortDirection === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      }
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
    });
  }, [filtered, sortField, sortDirection]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
    setPage(1);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-violet-400" />
    ) : (
      <ArrowDown className="h-3 w-3 text-violet-400" />
    );
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge variant="success">{score}</Badge>;
    if (score >= 50) return <Badge variant="warning">{score}</Badge>;
    return <Badge variant="secondary">{score}</Badge>;
  };

  if (loading) {
    return (
      <div className="glass-card rounded-lg border border-white/5 p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg border border-white/5 animate-in">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">Leads</h3>
          <Badge variant="info">{filtered.length} results</Badge>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="lead-search-input"
            placeholder="Search leads..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-sm text-muted-foreground">
              <th className="text-left p-3 pl-4 font-medium">
                <button
                  className="flex items-center gap-1 hover:text-foreground transition"
                  onClick={() => handleSort("business_name")}
                >
                  Business <SortIcon field="business_name" />
                </button>
              </th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">Contact</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Address</th>
              <th className="text-center p-3 font-medium">
                <button
                  className="flex items-center gap-1 mx-auto hover:text-foreground transition"
                  onClick={() => handleSort("rating")}
                >
                  Rating <SortIcon field="rating" />
                </button>
              </th>
              <th className="text-center p-3 font-medium hidden sm:table-cell">
                <button
                  className="flex items-center gap-1 mx-auto hover:text-foreground transition"
                  onClick={() => handleSort("reviews")}
                >
                  Reviews <SortIcon field="reviews" />
                </button>
              </th>
              <th className="text-center p-3 font-medium">
                <button
                  className="flex items-center gap-1 mx-auto hover:text-foreground transition"
                  onClick={() => handleSort("lead_score")}
                >
                  Score <SortIcon field="lead_score" />
                </button>
              </th>
              <th className="text-center p-3 pr-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  {leads.length === 0
                    ? "No leads yet. Run a search to find leads."
                    : "No leads match your search."}
                </td>
              </tr>
            ) : (
              paginated.map((lead, idx) => (
                <tr
                  key={lead.id || idx}
                  className="table-row-hover border-b border-white/[0.03] last:border-0"
                >
                  {/* Business Name */}
                  <td className="p-3 pl-4">
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">
                        {lead.business_name}
                      </p>
                      {lead.website && (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 mt-0.5"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-3 hidden lg:table-cell">
                    <div className="space-y-1">
                      {lead.phone && (
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                        >
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </a>
                      )}
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </a>
                      )}
                    </div>
                  </td>

                  {/* Address */}
                  <td className="p-3 hidden md:table-cell">
                    <p className="text-xs text-muted-foreground truncate max-w-[200px] flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {lead.address || "N/A"}
                    </p>
                  </td>

                  {/* Rating */}
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-medium">
                        {lead.rating ? lead.rating.toFixed(1) : "—"}
                      </span>
                    </div>
                  </td>

                  {/* Reviews */}
                  <td className="p-3 text-center hidden sm:table-cell">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-sm">{lead.reviews || 0}</span>
                    </div>
                  </td>

                  {/* Score */}
                  <td className="p-3 text-center">
                    {getScoreBadge(lead.lead_score || 0)}
                  </td>

                  {/* Actions */}
                  <td className="p-3 pr-4 text-center">
                    <a
                      href={lead.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex"
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
