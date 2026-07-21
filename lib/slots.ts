export interface TimeSlot {
  label: string
  value: string
  available: boolean
}

const DEFAULT_START_HOUR = 9
const DEFAULT_END_HOUR = 18
const DEFAULT_SLOT_DURATION_MINUTES = 60

export function generateTimeSlots(
  date: Date,
  durationMinutes: number = DEFAULT_SLOT_DURATION_MINUTES,
  startHour: number = DEFAULT_START_HOUR,
  endHour: number = DEFAULT_END_HOUR
): TimeSlot[] {
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const slots: TimeSlot[] = []
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += durationMinutes) {
      const totalMinutes = h * 60 + m
      if (isToday && totalMinutes <= currentMinutes + 30) continue

      const label = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      const endH = Math.floor((totalMinutes + durationMinutes) / 60)
      const endM = (totalMinutes + durationMinutes) % 60
      const endLabel = `${endH.toString().padStart(2, "0")}:${endM.toString().padStart(2, "0")}`
      slots.push({
        label: `${label} - ${endLabel}`,
        value: `${label}:00`,
        available: true,
      })
    }
  }
  return slots
}

export function getMinDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split("T")[0]
}

export function getMaxDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split("T")[0]
}
