import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "INSPECTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const inspectorId = session.user.id;

  try {
    const body = await request.json();
    const { sellerLeadId, ...checklist } = body;

    if (!sellerLeadId) {
      return NextResponse.json({ error: "Seller Lead ID is required" }, { status: 400 });
    }

    // Convert date string to Date object if provided
    const warrantyExpiry = checklist.warrantyExpiry ? new Date(checklist.warrantyExpiry) : null;

    // Create the Inspection checklist record
    const inspection = await prisma.inspection.create({
      data: {
        ageYears: parseInt(checklist.ageYears) || 0,
        ageMonths: parseInt(checklist.ageMonths) || 0,
        kmDriven: parseFloat(checklist.kmDriven) || 0,
        bodyDamage: checklist.bodyDamage || "pass",
        bodyDamagePhoto: checklist.bodyDamagePhoto || "",
        forkDamage: !!checklist.forkDamage,
        accidentHistory: checklist.accidentHistory || "clean",
        warrantyStatus: checklist.warrantyStatus || "out_of_warranty",
        warrantyType: checklist.warrantyType || "",
        warrantyExpiry,
        partsReplaced: !!checklist.partsReplaced,
        replacedParts: checklist.replacedParts || "",
        adminComments: checklist.adminComments || "",
        batteryCharge: parseFloat(checklist.batteryCharge) || 0,
        batteryHealth: parseFloat(checklist.batteryHealth) || 0,
        batteryVoltage: parseFloat(checklist.batteryVoltage) || 0,
        physicalDamage: !!checklist.physicalDamage,
        brakeSystem: checklist.brakeSystem || "pass",
        brakePads: checklist.brakePads || "good",
        wheelAlignment: checklist.wheelAlignment || "aligned",
        testDriveRating: parseInt(checklist.testDriveRating) || 0,
        testDriveNotes: checklist.testDriveNotes || "",
        techComments: checklist.techComments || "",
        sellerLeadId,
        inspectorId: inspectorId as string,
      },
    });

    // Update the SellerLead status to INSPECTED
    await prisma.sellerLead.update({
      where: { id: sellerLeadId },
      data: { status: "INSPECTED" },
    });

    return NextResponse.json({ success: true, id: inspection.id });
  } catch (error) {
    console.error("Submit Inspection Error:", error);
    return NextResponse.json({ error: "Failed to submit inspection" }, { status: 500 });
  }
}
