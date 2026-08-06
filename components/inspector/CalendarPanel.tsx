"use client";

import { useState } from "react";
import MonthCalendar from "./MonthCalendar";
import GoogleCalendarView, { type GoogleCalendarViewProps } from "./GoogleCalendarView";

export default function CalendarPanel({ bookings }: Omit<GoogleCalendarViewProps, "selectedDate" | "onDateChange">) {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
      <div className="lg:sticky lg:top-6">
        <MonthCalendar bookings={bookings} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </div>
      <GoogleCalendarView bookings={bookings} selectedDate={selectedDate} onDateChange={setSelectedDate} />
    </div>
  );
}
