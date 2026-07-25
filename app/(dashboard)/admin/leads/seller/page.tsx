import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { StatusBadge } from "@/components/StatusBadge";
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
import { Eye } from "lucide-react";

import { AssignInspectorDialog } from "@/components/admin/AssignInspectorDialog";

export default async function SellerLeadsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  const leads = await prisma.sellerLead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phone: true } },
      inspection: { select: { id: true } }
    },
  });

  const inspectors = await prisma.user.findMany({
    where: { role: "INSPECTOR" },
    select: { id: true, name: true, email: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Seller Leads</h1>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Reg Year</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id}>
                <TableCell className="whitespace-nowrap">
                  {format(new Date(lead.createdAt), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{lead.user.name || "N/A"}</div>
                  <div className="text-xs text-muted-foreground">{lead.user.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{lead.make} {lead.model}</div>
                  <div className="text-xs text-muted-foreground">{lead.vehicleNumber}</div>
                </TableCell>
                <TableCell>{lead.year}</TableCell>
                <TableCell>
                  <StatusBadge status={lead.status} />
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {lead.inspection ? (
                    <Link href={`/admin/inspections/${lead.inspection.id}`}>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" /> Review Inspection
                      </Button>
                    </Link>
                  ) : (
                    <AssignInspectorDialog leadId={lead.id} inspectors={inspectors} />
                  )}
                </TableCell>
              </TableRow>
            ))}
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No seller leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
