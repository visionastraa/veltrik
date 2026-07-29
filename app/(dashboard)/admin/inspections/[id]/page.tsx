import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InspectionActions } from "@/components/admin/InspectionActions";

export default async function InspectionReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  const resolvedParams = await params;

  const inspection = await prisma.inspection.findUnique({
    where: { id: resolvedParams.id },
    include: {
      sellerLead: { include: { user: true } },
      inspector: true,
    }
  });

  if (!inspection) {
    notFound();
  }

  const processed = ["ACQUIRED", "REJECTED"].includes(inspection.sellerLead.status);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inspection Review</h1>
          <p className="text-muted-foreground mt-1">
            {inspection.sellerLead.make} {inspection.sellerLead.model} {inspection.sellerLead.year}
          </p>
        </div>
        <StatusBadge status={inspection.sellerLead.status} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seller Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{inspection.sellerLead.user.name || "N/A"}</span></div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Email:</span> 
              {inspection.sellerLead.user.email ? (
                <a href={`mailto:${inspection.sellerLead.user.email}`} className="text-primary hover:underline font-medium">{inspection.sellerLead.user.email}</a>
              ) : <span>N/A</span>}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone:</span> 
              {inspection.sellerLead.user.phone ? (
                <div className="flex items-center gap-3">
                  <a href={`tel:${inspection.sellerLead.user.phone}`} className="text-primary hover:underline font-medium">{inspection.sellerLead.user.phone}</a>
                  <a href={`https://wa.me/${inspection.sellerLead.user.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium text-xs bg-green-50 px-2 py-1 rounded">WhatsApp</a>
                </div>
              ) : <span>N/A</span>}
            </div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Expected Price:</span> <span className="font-medium">₹{inspection.sellerLead.expectedPrice || "N/A"}</span></div>
            <div className="flex justify-between items-center"><span className="text-muted-foreground">Vehicle Number:</span> <span className="font-medium">{inspection.sellerLead.vehicleNumber}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Part 1: Visual / Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Age:</span> <span>{inspection.ageYears} Yrs, {inspection.ageMonths} Mos</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">KM Driven:</span> <span>{inspection.kmDriven}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Body Damage:</span> <span>{inspection.bodyDamage}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Accident History:</span> <span>{inspection.accidentHistory}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Warranty:</span> <span>{inspection.warrantyStatus}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Part 2: Technical / Performance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div><span className="block text-muted-foreground mb-1">Battery Charge</span><span className="font-medium">{inspection.batteryCharge}%</span></div>
            <div><span className="block text-muted-foreground mb-1">Battery Health</span><span className="font-medium">{inspection.batteryHealth}%</span></div>
            <div><span className="block text-muted-foreground mb-1">Battery Voltage</span><span className="font-medium">{inspection.batteryVoltage}V</span></div>
            <div><span className="block text-muted-foreground mb-1">Brake System</span><span className="font-medium">{inspection.brakeSystem}</span></div>
            <div><span className="block text-muted-foreground mb-1">Brake Pads</span><span className="font-medium">{inspection.brakePads}</span></div>
            <div><span className="block text-muted-foreground mb-1">Wheel Alignment</span><span className="font-medium">{inspection.wheelAlignment}</span></div>
            <div><span className="block text-muted-foreground mb-1">Test Drive Rating</span><span className="font-medium">{inspection.testDriveRating} / 5</span></div>
          </div>
          {inspection.testDriveNotes && (
            <div className="mt-4 bg-gray-50 p-3 rounded text-gray-700">
              <span className="font-semibold block mb-1">Test Drive Notes:</span>
              {inspection.testDriveNotes}
            </div>
          )}
        </CardContent>
      </Card>

      <InspectionActions inspectionId={inspection.id} disabled={processed} />
    </div>
  );
}
