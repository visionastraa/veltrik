"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Calendar, User, Phone, ArrowRight, ArrowLeft, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueueItem {
  id: string;
  scheduledAt: Date;
  sellerLead: {
    id: string;
    brand: string;
    model: string;
    year: number;
    seller: {
      name: string | null;
      phone: string | null;
    };
  } | null;
  user: {
    name: string | null;
    phone: string | null;
  };
}

interface QueueTableProps {
  bookings: QueueItem[];
}

export default function QueueTable({ bookings }: QueueTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  // Filter bookings based on search query
  const filteredBookings = bookings.filter((b) => {
    const lead = b.sellerLead;
    const seller = lead?.seller || b.user;
    const searchTerm = search.toLowerCase();
    
    const brandMatch = lead?.brand.toLowerCase().includes(searchTerm) || false;
    const modelMatch = lead?.model.toLowerCase().includes(searchTerm) || false;
    const nameMatch = seller?.name?.toLowerCase().includes(searchTerm) || false;

    return brandMatch || modelMatch || nameMatch;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage) || 1;
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  return (
    <div className="space-y-4">
      {/* Filters Area */}
      <div className="relative max-w-md">
        <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
          <Search className="size-4" />
        </span>
        <input
          type="text"
          placeholder="Filter by brand, model, or seller name..."
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
        />
      </div>

      {/* Table grid */}
      <div className="bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs">
        {paginatedBookings.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground space-y-2">
            <ClipboardList className="size-10 mx-auto text-muted-foreground opacity-40" />
            <p className="font-bold text-foreground">No matches found</p>
            <p className="text-xs">Try adjusting your search filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-6">Date & Time</th>
                  <th className="py-3.5 px-6">Vehicle Details</th>
                  <th className="py-3.5 px-6">Seller Info</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedBookings.map((booking) => {
                  const lead = booking.sellerLead;
                  const seller = lead?.seller || booking.user;
                  const dateStr = new Date(booking.scheduledAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  const timeStr = new Date(booking.scheduledAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });

                  return (
                    <tr key={booking.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="size-4.5 text-muted-foreground" />
                          <div>
                            <span className="text-sm font-bold text-foreground block">{dateStr}</span>
                            <span className="text-xs text-muted-foreground">{timeStr}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-bold text-foreground text-sm">
                        {lead ? `${lead.year} ${lead.brand} ${lead.model}` : "Unknown Vehicle"}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <User className="size-3.5 text-muted-foreground" />
                            <span>{seller?.name || "Unknown"}</span>
                          </div>
                          {seller?.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="size-3" />
                              <span>{seller.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-destructive/20 bg-destructive/10 text-destructive text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                          Pending
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <Link
                          href={`/inspector/inspect/${lead?.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline group-hover:translate-x-0.5 transition-transform"
                        >
                          <span>Open Info</span>
                          <ArrowRight className="size-3.5" />
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
