import { prisma } from "@/lib/prisma"

type LeadSummary = {
  id: string
  make: string
  model: string
  variant?: string
  year?: number
  vehicleNumber?: string
  kmDriven?: number
  sellerName?: string
  sellerPhone?: string
}

export async function pickLeastBusyInspector() {
  const inspectors = await prisma.user.findMany({
    where: { role: "INSPECTOR" },
    select: {
      id: true,
      name: true,
      email: true,
      _count: {
        select: {
          inspections: {
            where: { inspectionComplete: false },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  if (inspectors.length === 0) return null

  inspectors.sort((a, b) => a._count.inspections - b._count.inspections)
  return inspectors[0]
}

export async function notifyInspectionAssigned(opts: {
  inspector: { id: string; name: string | null; email: string }
  lead: LeadSummary
}) {
  const { inspector, lead } = opts
  try {
    const { sendEmail } = await import("@/lib/email")

    await sendEmail({
      to: inspector.email,
      subject: `New Inspection Assigned: ${lead.make} ${lead.model}`,
      html: `
        <h3>You have been assigned a new vehicle for inspection</h3>
        <p><strong>Vehicle:</strong> ${lead.make} ${lead.model} ${lead.variant ?? ""} (${lead.year ?? ""})</p>
        <p><strong>Reg No:</strong> ${lead.vehicleNumber ?? "Not provided"}</p>
        <p><strong>Driven:</strong> ${lead.kmDriven ?? "-"} km</p>
        <p><strong>Seller:</strong> ${lead.sellerName ?? "Seller"}</p>
        <p><strong>Phone:</strong> ${lead.sellerPhone ?? "Not provided"}</p>
        <p>Please log in to your inspector dashboard to view more details.</p>
      `,
      userId: inspector.id,
      type: "INSPECTION_ASSIGNED",
    })

    await prisma.notificationLog.create({
      data: {
        userId: inspector.id,
        type: "INSPECTION_ASSIGNED",
        channel: "IN_APP",
        status: "SENT",
        payload: JSON.stringify({
          title: "New Assignment",
          message: `You have been assigned to inspect ${lead.make} ${lead.model}`,
        }),
      },
    })
  } catch (error) {
    console.error("[inspector-assignment] Failed to send notifications:", error)
  }
}
