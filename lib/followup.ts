export interface FollowupSchedule {
  leadId: string
  type: "buyer" | "seller"
  scheduledAt: Date
  note?: string
}

const FOLLOWUP_INTERVALS: Record<string, number> = {
  immediate: 0,
  day1: 1,
  day3: 3,
  week1: 7,
  week2: 14,
  month1: 30,
}

export function calculateFollowupDate(from: Date, interval: keyof typeof FOLLOWUP_INTERVALS): Date {
  const days = FOLLOWUP_INTERVALS[interval] || 7
  const result = new Date(from)
  result.setDate(result.getDate() + days)
  return result
}

export function getDefaultFollowupSchedule(leadId: string, type: "buyer" | "seller"): FollowupSchedule[] {
  const now = new Date()
  if (type === "buyer") {
    return [
      { leadId, type, scheduledAt: calculateFollowupDate(now, "day1"), note: "Initial follow-up: ask if they found what they're looking for" },
      { leadId, type, scheduledAt: calculateFollowupDate(now, "week1"), note: "Second follow-up: share new listings matching their interest" },
      { leadId, type, scheduledAt: calculateFollowupDate(now, "month1"), note: "Final follow-up: check if still interested" },
    ]
  }
  return [
    { leadId, type, scheduledAt: calculateFollowupDate(now, "day1"), note: "Initial follow-up: update on inspection status" },
    { leadId, type, scheduledAt: calculateFollowupDate(now, "day3"), note: "Update on offer/listing progress" },
    { leadId, type, scheduledAt: calculateFollowupDate(now, "week2"), note: "Check if vehicle is still available or sold" },
  ]
}

export async function scheduleFollowups(schedules: FollowupSchedule[]): Promise<{ success: boolean }> {
  for (const s of schedules) {
    const delayMs = s.scheduledAt.getTime() - Date.now()
    if (delayMs <= 0) {
      console.warn(`[followup] Skipping past date for lead ${s.leadId}`)
      continue
    }
    setTimeout(() => {
      console.log(`[followup] Triggering ${s.type} follow-up for lead ${s.leadId}: ${s.note || "No notes"}`)
    }, delayMs)
  }
  return { success: true }
}
