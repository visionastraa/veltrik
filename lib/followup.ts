import { prisma } from "./prisma";
import { sendEmail } from "./mailer";

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
      text: `${leadsToUpdate.length} buyer visits occurred over 24 hours ago. Please check the CRM dashboard and follow up with the customers.`
    });

    return { updatedCount: result.count };
  } catch (error) {
    console.error("[FOLLOWUP_JOB_ERROR]", error);
    return { error: "Failed to run follow-up job", updatedCount: 0 };
  }
}
