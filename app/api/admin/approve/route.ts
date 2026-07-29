import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const adminId = (session?.user as any)?.id;

    // Only Managers can approve (project.md: "MANAGER role required to approve/reject")
    if (!session || !["MANAGER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { inspectionId, finalOffer } = body;

    if (!inspectionId || !finalOffer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { sellerLead: true }
    });

    if (!inspection) {
      return NextResponse.json({ error: "Inspection not found" }, { status: 404 });
    }

    if (inspection.sellerLead.status === "ACQUIRED") {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    // Process Photos
    let combinedPhotos: string[] = [];
    
    // Helper to safely parse photos since they might be double stringified
    const parsePhotos = (input: any): string[] => {
      if (!input) return [];
      let parsed = input;
      while (typeof parsed === 'string') {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          break;
        }
      }
      return Array.isArray(parsed) ? parsed : [];
    };

    const leadPhotos = parsePhotos(inspection.sellerLead.photos);
    combinedPhotos.push(...leadPhotos);
    
    if (inspection.bodyDamagePhoto) {
      const damagePhotos = parsePhotos(inspection.bodyDamagePhoto);
      if (damagePhotos.length > 0) {
        combinedPhotos.push(...damagePhotos);
      } else {
        combinedPhotos.push(inspection.bodyDamagePhoto); // fallback if it's a raw URL
      }
    }

    // Deduplicate and remove empty
    combinedPhotos = [...new Set(combinedPhotos.filter(p => p && p.trim() !== ''))];

    if (combinedPhotos.length === 0) {
      return NextResponse.json({ error: "Cannot create listing: No valid photos found after combining lead and inspection photos." }, { status: 400 });
    }

    // Transaction to update inspection, lead, and create listing
    await prisma.$transaction(async (tx) => {
      // 1. Update Inspection with offer
      await tx.inspection.update({
        where: { id: inspectionId },
        data: {
          finalOffer: parseFloat(finalOffer),
          approvedById: adminId,
          approvedAt: new Date(),
        }
      });

      // 2. Update Seller Lead Status
      await tx.sellerLead.update({
        where: { id: inspection.sellerLeadId },
        data: { status: "ACQUIRED" }
      });

      // 3. Create Listing (title: Make Model Year)
      await tx.listing.create({
        data: {
          inspectionId: inspection.id,
          title: `${inspection.sellerLead.make} ${inspection.sellerLead.model} ${inspection.sellerLead.year}`,
          price: parseFloat(finalOffer),
          status: "AVAILABLE",
          photos: JSON.stringify(combinedPhotos), // Save correctly
          publishedAt: new Date(),
        }
      });
    });

    // Notifications
    try {
      const { sendEmail } = await import('@/lib/email');
      const sellerId = inspection.sellerLead.userId;
      
      const user = await prisma.user.findUnique({ where: { id: sellerId }});
      if (user?.email) {
        // Send Email to Seller
        await sendEmail({
          to: user.email,
          subject: `Offer Received: ${inspection.sellerLead.make} ${inspection.sellerLead.model}`,
          html: `
            <h3>Great news! We have an offer for your vehicle.</h3>
            <p><strong>Vehicle:</strong> ${inspection.sellerLead.make} ${inspection.sellerLead.model} (${inspection.sellerLead.year})</p>
            <p><strong>Offer Price:</strong> ₹${parseFloat(finalOffer).toLocaleString()}</p>
            <p>Please log in to your dashboard to review and accept the offer.</p>
          `,
          userId: sellerId,
          type: "OFFER_MADE",
        });
      }

      // Create IN_APP notification
      await prisma.notificationLog.create({
        data: {
          userId: sellerId,
          type: "OFFER_MADE",
          channel: "IN_APP",
          status: "SENT",
          payload: JSON.stringify({ 
            title: "Offer Received", 
            message: `We have made a final offer of ₹${parseFloat(finalOffer).toLocaleString()} for your ${inspection.sellerLead.make}.` 
          }),
        },
      });
    } catch (notificationError) {
      console.error("[Approve] Failed to send notifications:", notificationError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ADMIN_APPROVE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
