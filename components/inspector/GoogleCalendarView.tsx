"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, User, Phone, ArrowRight, Calendar, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingItem {
  id: string;
  scheduledAt: Date;
  sellerLead: {
    id: string;
    brand: string;
    model: string;
    year: number;
    status: string;
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

interface GoogleCalendarViewProps {
  bookings: BookingItem[];
}

const timeSlots = [
  { hour: 10, label: "10:00 AM" },
  { hour: 11, label: "11:00 AM" },
  { hour: 12, label: "12:00 PM" },
  { hour: 13, label: "01:00 PM" },
  { hour: 14, label: "02:00 PM" },
  { hour: 15, label: "03:00 PM" },
  { hour: 16, label: "04:00 PM" },
  { hour: 17, label: "05:00 PM" },
  { hour: 18, label: "06:00 PM" },
];

export default function GoogleCalendarView({ bookings }: GoogleCalendarViewProps) {
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState("all");

  const handlePrevDay = () => {
    setSelectedDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(prev.getDate() - 1);
      return nextDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => {
      const nextDate = new Date(prev);
      nextDate.setDate(prev.getDate() + 1);
      return nextDate;
    });
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const handleGoToTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  // Filter bookings by selected day, search terms, and status
  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.scheduledAt);
    const dateMatch =
      bookingDate.getDate() === selectedDate.getDate() &&
      bookingDate.getMonth() === selectedDate.getMonth() &&
      bookingDate.getFullYear() === selectedDate.getFullYear();

    if (!dateMatch) return false;

    const lead = b.sellerLead;
    const seller = lead?.seller || b.user;
    const isCompleted = lead?.status === "INSPECTED";

    if (statusFilter === "completed" && !isCompleted) return false;
    if (statusFilter === "pending" && isCompleted) return false;

    const searchTerm = search.toLowerCase();

    return (
      lead?.brand.toLowerCase().includes(searchTerm) ||
      lead?.model.toLowerCase().includes(searchTerm) ||
      seller?.name?.toLowerCase().includes(searchTerm) ||
      false
    );
  });

  // Find booking for a specific hour slot
  const getBookingForHour = (hour: number) => {
    return filteredBookings.find((b) => {
      const bDate = new Date(b.scheduledAt);
      return bDate.getHours() === hour;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Calendar Header Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border/80 rounded-2xl p-4 shadow-sm">
        
        {/* Day Navigations (Prev, Today, Next) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToToday}
              className="cursor-pointer font-bold text-xs"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToTomorrow}
              className="cursor-pointer font-bold text-xs"
            >
              Tomorrow
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevDay}
              className="cursor-pointer font-bold text-xs flex items-center gap-1"
            >
              <ChevronLeft className="size-4" />
              <span>Prev</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextDay}
              className="cursor-pointer font-bold text-xs flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-1.8 rounded-xl border border-border bg-background text-xs outline-none focus:border-ring focus:ring-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          {/* Filter Input */}
          <div className="relative w-full sm:w-48">
            <span className="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
              <Search className="size-4" />
            </span>
            <input
              type="text"
              placeholder="Search details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.8 rounded-xl border border-border bg-background text-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>
        </div>
      </div>

      {/* Google Calendar Time Grid View */}
      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-foreground mb-6 flex items-center gap-2 border-b border-border pb-3">
          <Calendar className="size-5 text-muted-foreground" />
          <span>
            Schedule for {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </h2>

        {/* Time Grid list */}
        <div className="space-y-4">
          {timeSlots.map((slot) => {
            const booking = getBookingForHour(slot.hour);
            const lead = booking?.sellerLead;
            const seller = lead?.seller || booking?.user;
            const isCompleted = lead?.status === "INSPECTED";

            return (
              <div key={slot.hour} className="flex gap-4 items-start min-h-[5rem]">
                {/* Time Column */}
                <div className="w-20 text-right pt-1 shrink-0">
                  <span className="text-xs font-extrabold text-muted-foreground tracking-wider uppercase">
                    {slot.label}
                  </span>
                </div>

                {/* Event Block */}
                <div className="flex-1 min-h-[4.5rem] relative">
                  {booking ? (
                    <div
                      className={cn(
                        "absolute inset-x-0 top-0 bottom-0 rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all duration-200",
                        isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
                          : "bg-primary/5 border-primary/10 hover:border-primary/30 text-primary dark:text-primary-foreground"
                      )}
                    >
                      <div className="space-y-1">
                        <h4 className="text-sm font-extrabold tracking-tight">
                          {lead ? `${lead.year} ${lead.brand} ${lead.model}` : "Inspection Appointment"}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-85">
                          <span className="flex items-center gap-1">
                            <User className="size-3.5" />
                            {seller?.name}
                          </span>
                          {seller?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3" />
                              {seller.phone}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Link to start/view checklist */}
                      {lead && (
                        <Link
                          href={`/inspector/inspect/${lead.id}`}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs self-start sm:self-auto cursor-pointer",
                            isCompleted
                              ? "bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600"
                              : "bg-primary text-primary-foreground border-primary hover:bg-primary/90"
                          )}
                        >
                          <span>{isCompleted ? "View Details" : "Start Checklist"}</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      )}
                    </div>
                  ) : (
                    // Available Slot placeholder (dashed border)
                    <div className="h-full border border-dashed border-border/80 rounded-2xl flex items-center justify-center p-4 text-xs font-semibold text-muted-foreground/50 select-none pointer-events-none min-h-[4.5rem]">
                      Available Booking Slot
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
