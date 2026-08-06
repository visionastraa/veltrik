"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, User, Eye, Star, ArrowLeft, ArrowRight, ClipboardCopy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryItem {
  id: string;
  createdAt: Date;
  ageYears: number | null;
  ageMonths: number | null;
  kmDriven: number | null;
  batteryHealth: number | null;
  testDriveRating: number | null;
  sellerLead: {
    id: string;
    make: string;
    model: string;
    year: number;
    user: {
      name: string | null;
      phone: string | null;
    };
  } | null;
}

interface HistoryTableProps {
  inspections: HistoryItem[];
}

export default function HistoryTable({ inspections }: HistoryTableProps) {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [mileageFilter, setMileageFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter inspections based on search query, rating, mileage, and date range
  const filteredInspections = inspections.filter((ins) => {
    const lead = ins.sellerLead;
    const seller = lead?.user;
    const searchTerm = search.toLowerCase();
    
    const brandMatch = lead?.make.toLowerCase().includes(searchTerm) || false;
    const modelMatch = lead?.model.toLowerCase().includes(searchTerm) || false;
    const nameMatch = seller?.name?.toLowerCase().includes(searchTerm) || false;
    const textMatch = brandMatch || modelMatch || nameMatch;

    if (!textMatch) return false;
    
    const ratingMatch = 
      ratingFilter === "all" || 
      ins.testDriveRating === parseInt(ratingFilter);

    if (!ratingMatch) return false;

    // Mileage filter
    if (mileageFilter === "under10") {
      if ((ins.kmDriven || 0) >= 10000) return false;
    } else if (mileageFilter === "10to50") {
      if ((ins.kmDriven || 0) < 10000 || (ins.kmDriven || 0) > 50000) return false;
    } else if (mileageFilter === "over50") {
      if ((ins.kmDriven || 0) <= 50000) return false;
    }

    // Date range checking
    const inspectionDate = new Date(ins.createdAt);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      if (inspectionDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      if (inspectionDate > end) return false;
    }

    return true;
  });

  // Sort inspections
  const sortedInspections = [...filteredInspections].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedInspections.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedInspections = sortedInspections.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      {/* Filters Area */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="size-4" />
            </span>
            <input
              type="text"
              placeholder="Filter by make, model, or seller name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>

          {/* Rating filter */}
          <div className="sm:w-44">
            <select
              value={ratingFilter}
              onChange={(e) => {
                setRatingFilter(e.target.value);
                setPage(1);
              }}
              className="glass w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:border-ring focus:ring-2"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {/* Mileage filter */}
          <div className="sm:w-44">
            <select
              value={mileageFilter}
              onChange={(e) => {
                setMileageFilter(e.target.value);
                setPage(1);
              }}
              className="glass w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:border-ring focus:ring-2"
            >
              <option value="all">All Mileage</option>
              <option value="under10">Under 10,000 km</option>
              <option value="10to50">10,000 - 50,000 km</option>
              <option value="over50">Over 50,000 km</option>
            </select>
          </div>

          {/* Sort Order filter */}
          <div className="sm:w-44">
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value);
                setPage(1);
              }}
              className="glass w-full px-3.5 py-2 rounded-xl border text-sm outline-none focus:border-ring focus:ring-2"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Date Range Fields */}
        <div className="flex flex-wrap items-center gap-3 bg-muted/20 border border-border/60 rounded-xl p-3">
          <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase flex items-center gap-1">
            <Calendar className="size-3.5" />
            Date Range:
          </span>
          
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setPage(1);
              }}
              className="text-xs font-bold cursor-pointer text-destructive hover:bg-destructive/10"
            >
              Clear Date Filter
            </Button>
          )}
        </div>
      </div>

      {/* Table grid */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        {paginatedInspections.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <ClipboardCopy className="size-10 mx-auto text-muted-foreground opacity-40" />
            <p className="font-bold text-foreground">No matches found</p>
            <p className="text-xs">Try adjusting your search or rating filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-6">Completion Date</th>
                  <th className="py-3.5 px-6">Vehicle Details</th>
                  <th className="py-3.5 px-6">Seller Details</th>
                  <th className="py-3.5 px-6">Odometer & Battery</th>
                  <th className="py-3.5 px-6">Test Drive Rating</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedInspections.map((inspection) => {
                  const lead = inspection.sellerLead;
                  const seller = lead?.user;
                  const dateStr = new Date(inspection.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  return (
                    <tr key={inspection.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="py-4.5 px-6 text-sm font-bold text-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="size-4.5 text-muted-foreground" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="text-sm font-extrabold text-foreground block">
                          {lead ? `${lead.year} ${lead.make} ${lead.model}` : "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium block">
                          Age: {inspection.ageYears}y {inspection.ageMonths}m
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-sm font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <User className="size-3.5 text-muted-foreground" />
                          <span>{seller?.name || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-xs font-medium text-muted-foreground space-y-1">
                        <div>
                          Odometer: <strong className="text-foreground">{inspection.kmDriven} KM</strong>
                        </div>
                        <div>
                          Battery: <strong className="text-foreground">{inspection.batteryHealth}% SOH</strong>
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                          <Star className="size-4 fill-amber-400 text-amber-400" />
                          <span>{inspection.testDriveRating}/5</span>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <Link
                          href={`/inspector/inspect/${lead?.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        >
                          <Eye className="size-4" />
                          <span>View Detail</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="cursor-pointer"
            >
              <ArrowLeft className="size-3.5 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="cursor-pointer"
            >
              Next
              <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
