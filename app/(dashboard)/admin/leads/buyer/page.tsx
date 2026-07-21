import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BuyerStatusEditor } from "@/components/admin/BuyerStatusEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { triggerFollowUpAutoFlags } from "@/lib/followup";
import Link from "next/link";

export default async function BuyerLeadsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  // Trigger auto-flagging on page load (as specified in project.md)
  await triggerFollowUpAutoFlags();

  const leads = await prisma.buyerLead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phone: true, email: true } },
      listing: { select: { title: true, id: true } }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Buyer CRM</h1>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Interested In</TableHead>
              <TableHead>Status Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead: any) => {
              let brands = [];
              let models = [];
              try { brands = JSON.parse(lead.brandsInterested || "[]"); } catch (e) {}
              try { models = JSON.parse(lead.modelsInterested || "[]"); } catch (e) {}

              return (
                <TableRow key={lead.id}>
                  <TableCell className="whitespace-nowrap align-top">
                    {format(new Date(lead.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="font-medium">{lead.user.name || "N/A"}</div>
                    <div className="text-xs text-muted-foreground">{lead.user.phone || lead.user.email}</div>
                  </TableCell>
                  <TableCell className="align-top">
                    {lead.listing ? (
                      <div>
                        <span className="text-xs font-semibold block mb-1">Specific Listing:</span>
                        <Link href={`/inventory/${lead.listing.id}`} className="text-sm text-blue-600 hover:underline">
                          {lead.listing.title}
                        </Link>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {brands.length > 0 ? brands.join(", ") : "Any Brand"}
                        <br />
                        {models.length > 0 ? models.join(", ") : "Any Model"}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="align-top w-[220px]">
                    <BuyerStatusEditor lead={{ id: lead.id, status: lead.status }} />
                  </TableCell>
                </TableRow>
              );
            })}
            {leads.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No buyer leads found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
