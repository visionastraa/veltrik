"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Clock, Check, AlertCircle } from "lucide-react"
import { generateTimeSlots, getMinDate, getMaxDate, type TimeSlot } from "@/lib/slots"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface BookingCalendarProps {
  onSelectSlot: (date: Date, slotValue: string) => void
  selectedDate?: Date
  selectedSlot?: string
  className?: string
}

export function BookingCalendar({
  onSelectSlot,
  selectedDate: initialDate,
  selectedSlot: initialSlot,
  className,
}: BookingCalendarProps) {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    initialDate ? initialDate.toISOString().split("T")[0] : getMinDate()
  )
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot || "")

  const currentDate = new Date(selectedDateStr)
  const isSunday = currentDate.getDay() === 0
  const timeSlots: TimeSlot[] = isSunday ? [] : generateTimeSlots(currentDate)

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDateStr = e.target.value
    setSelectedDateStr(newDateStr)
    setSelectedSlot("")
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.available) return
    setSelectedSlot(slot.value)

    const [hours, minutes] = slot.value.split(":").map(Number)
    const bookingDate = new Date(selectedDateStr)
    bookingDate.setHours(hours, minutes, 0, 0)

    onSelectSlot(bookingDate, slot.value)
  }

  return (
    <div className={cn("space-y-4 p-4 border border-gray-200 rounded-2xl bg-white shadow-sm", className)}>
      {/* Date Picker Header */}
      <div className="space-y-1.5">
        <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-primary" />
          Select Booking Date
        </Label>
        <Input
          type="date"
          min={getMinDate()}
          max={getMaxDate()}
          value={selectedDateStr}
          onChange={handleDateChange}
          className="rounded-xl border-gray-300 focus:border-primary focus:ring-primary text-sm font-medium"
        />
      </div>

      {/* Sunday Warning */}
      {isSunday && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          Workshop & inspection centers are closed on Sundays. Please select a Mon–Sat date.
        </div>
      )}

      {/* Time Slots Grid */}
      {!isSunday && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-600 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Available Time Slots (Mon–Sat, 10:00 AM – 5:30 PM)
            </span>
            <Badge variant="outline" className="text-[10px] text-gray-500 border-gray-200 font-normal">
              Capacity: Max 3 / slot
            </Badge>
          </Label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {timeSlots.map((slot) => {
              const isSelected = selectedSlot === slot.value
              return (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.available}
                  className={cn(
                    "px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between",
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md scale-[1.02]"
                      : slot.available
                      ? "border-gray-200 bg-gray-50/80 text-gray-800 hover:border-primary/50 hover:bg-primary/5"
                      : "border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed line-through"
                  )}
                >
                  <span>{slot.label.split(" - ")[0]}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Selected Confirmation Text */}
      {selectedSlot && !isSunday && (
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs font-semibold text-primary flex items-center justify-between">
          <span>Selected Slot:</span>
          <span>{currentDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} @ {selectedSlot}</span>
        </div>
      )}
    </div>
  )
}
