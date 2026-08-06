"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MonthCalendarProps {
  bookings: { scheduledAt: Date }[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function MonthCalendar({ bookings, selectedDate, onSelectDate }: MonthCalendarProps) {
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  useEffect(() => {
    setViewYear(selectedDate.getFullYear());
    setViewMonth(selectedDate.getMonth());
  }, [selectedDate]);

  const bookedMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of bookings) {
      const d = new Date(b.scheduledAt);
      const key = toKey(d);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return map;
  }, [bookings]);

  const today = new Date();

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const cells = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const startOffset = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

    const list: { day: number; inMonth: boolean }[] = [];
    for (let i = startOffset - 1; i >= 0; i--) list.push({ day: daysInPrev - i, inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) list.push({ day: d, inMonth: true });
    const total = Math.ceil(list.length / 7) * 7;
    let next = 1;
    while (list.length < total) list.push({ day: next++, inMonth: false });

    return list;
  }, [viewYear, viewMonth]);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const monthCount = useMemo(() => {
    let count = 0;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      count += bookedMap.get(toKey(new Date(viewYear, viewMonth, d))) ?? 0;
    }
    return count;
  }, [bookedMap, viewYear, viewMonth]);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-foreground flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" />
          {monthLabel}
        </h2>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon" className="size-7" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-bold"
            onClick={() => onSelectDate(new Date())}
          >
            Today
          </Button>
          <Button variant="ghost" size="icon" className="size-7" onClick={goNext} aria-label="Next month">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70 py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map(({ day, inMonth }, idx) => {
          const date = new Date(viewYear, viewMonth, day);
          const key = toKey(date);
          const count = bookedMap.get(key) ?? 0;
          const isToday = inMonth && toKey(today) === key;
          const isSelected = inMonth && toKey(selectedDate) === key;
          const isSunday = date.getDay() === 0;

          const tooltip = inMonth
            ? count > 0
              ? `${count} inspection${count > 1 ? "s" : ""} on ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : undefined;

          return (
            <button
              key={idx}
              type="button"
              disabled={!inMonth}
              onClick={() => onSelectDate(date)}
              title={tooltip}
              className={cn(
                "relative aspect-square w-full rounded-lg text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all",
                !inMonth && "text-muted-foreground/30 cursor-default",
                inMonth && isSunday && !isSelected && "text-muted-foreground/45 bg-muted/50 cursor-default",
                isToday && !isSelected && "ring-1 ring-primary/70 ring-inset",
                isSelected && "bg-primary text-primary-foreground shadow-md",
                inMonth && !isSunday && !isSelected && "hover:bg-primary/10 hover:text-primary cursor-pointer",
                inMonth && count > 0 && !isSelected && "bg-primary/10 text-primary font-extrabold hover:bg-primary/20"
              )}
            >
              <span className="leading-none">{day}</span>
              {count > 0 && (
                <span
                  className={cn(
                    "min-w-4 h-4 px-1 rounded-full text-[9px] font-extrabold leading-none flex items-center justify-center",
                    isSelected ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
                  )}
                >
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="min-w-4 h-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-extrabold flex items-center justify-center">n</span>
          Inspections booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded ring-1 ring-inset ring-primary/70" /> Today
        </span>
        <span className="ml-auto font-bold text-foreground">
          {monthCount > 0 ? `${monthCount} inspection${monthCount > 1 ? "s" : ""} this month` : "No inspections this month"}
        </span>
      </div>
    </div>
  );
}
