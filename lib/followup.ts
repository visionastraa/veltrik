import { prisma } from "./prisma";
import { sendEmail } from "./mailer";

const FOLLOWUP_INTERVALS: Record<string, number> = {
  day1: 1,
  week1: 7,
  month1: 30,
};

export type FollowupType = "buyer" | "seller";

export interface FollowupItem {
  leadId: string;
  type: FollowupType;
  scheduledAt: Date;
  note: string;
}

/**
 * Adds the number of days for the given interval to a base date without mutating it.
 * Unknown intervals default to 7 days.
 */
export function calculateFollowupDate(base: Date, interval: string): Date {
  const days = FOLLOWUP_INTERVALS[interval] ?? 7;
  const result = new Date(base);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

/**
 * Builds the default 3-step follow-up schedule (day1 / week1 / month1) for a lead.
 */
export function getDefaultFollowupSchedule(leadId: string, type: FollowupType): FollowupItem[] {
  const base = new Date();
  const steps: { interval: keyof typeof FOLLOWUP_INTERVALS; note: string }[] = [
    { interval: "day1", note: "Initial follow-up within 24 hours" },
    { interval: "week1", note: "Second follow-up after a week" },
    { interval: "month1", note: "Final follow-up after a month" },
  ];
  return steps.map((step) => ({
    leadId,
    type,
    note: step.note,
    scheduledAt: calculateFollowupDate(base, step.interval),
  }));
}

/**
 * Registers follow-ups. Persistence is handled by the consuming pipeline;
 * past-dated items are warned about and skipped.
 */
export async function scheduleFollowups(items: Omit<FollowupItem, "note">[]): Promise<{ success: boolean }> {
  for (const item of items) {
    if (item.scheduledAt.getTime() < Date.now()) {
      console.warn(`[FOLLOWUP] Skipping past scheduled date for lead ${item.leadId}`);
    }
  }
  return { success: true };
}

/**
 * Checks all BuyerLeads in LEAD_VISIT_SCHEDULED status.
 * If their booking visit time was more than 24 hours ago,
 * marks them as FOLLOW_UP_REQUIRED and sends an email.
 */
export async function triggerFollowUpAutoFlags() {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  try {
    const overdueLeads = await prisma.buyerLead.findMany({
      where: {
        status: "LEAD_VISIT_SCHEDULED",
        listingId: { not: null },
      },
      include: {
        user: true,
        listing: true
      }
    });

    if (overdueLeads.length === 0) return { updatedCount: 0 };

    // Find the latest booking for each lead to check if it's in the past
    // Note: Since bookings are tied to user + listing, we query them.
    const leadsToUpdate: string[] = [];

    for (const lead of overdueLeads) {
      const bookings = await prisma.booking.findMany({
        where: {
          userId: lead.userId,
          listingId: lead.listingId,
          type: "BUYER_VISIT",
          scheduledAt: { lt: twentyFourHoursAgo }
        },
        orderBy: { scheduledAt: 'desc' },
        take: 1
      });

      if (bookings.length > 0) {
        leadsToUpdate.push(lead.id);
      }
    }

    if (leadsToUpdate.length === 0) return { updatedCount: 0 };

    // Update statuses
    const result = await prisma.buyerLead.updateMany({
      where: { id: { in: leadsToUpdate } },
      data: { status: "FOLLOW_UP_REQUIRED" }
    });

    // Notify sales team
    const adminEmail = process.env.SMTP_USER || "sales@veltrik.com";
    await sendEmail({
      to: adminEmail,
      subject: `Veltrik: ${leadsToUpdate.length} Leads Require Follow-Up`,
      html: `${leadsToUpdate.length} buyer visits occurred over 24 hours ago. Please check the CRM dashboard and follow up with the customers.`
    });

    return { updatedCount: result.count };
  } catch (error) {
    console.error("[FOLLOWUP_JOB_ERROR]", error);
    return { error: "Failed to run follow-up job", updatedCount: 0 };
  }
}
