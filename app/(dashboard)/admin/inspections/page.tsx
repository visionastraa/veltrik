import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Eye, CheckCircle, Clock } from "lucide-react";

export default async function InspectionsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  const inspections = await prisma.inspection.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sellerLead: true,
      inspector: { select: { name: true, email: true } }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vehicle Inspections</h1>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Inspector</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inspections.map((inspection) => {
              const isCompleted = inspection.sellerLead.status === "INSPECTED" || inspection.sellerLead.status === "ACQUIRED";
              
              return (
                <TableRow key={inspection.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(inspection.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {inspection.sellerLead.year} {inspection.sellerLead.make} {inspection.sellerLead.model}
                    </div>
                    <div className="text-xs text-muted-foreground">{inspection.sellerLead.vehicleNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{inspection.inspector.name || "Unnamed"}</div>
                    <div className="text-xs text-muted-foreground">{inspection.inspector.email}</div>
                  </TableCell>
                  <TableCell>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/inspections/${inspection.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" /> View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
            {inspections.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No inspections have been assigned yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
