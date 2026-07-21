import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ListingEditor } from "@/components/admin/ListingEditor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import Image from "next/image";

export default async function AdminListingsPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      sellerLead: { select: { vehicleNumber: true } },
      _count: { select: { buyerLeads: true, bookings: true } }
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Manage Listings</h1>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Photo</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Metrics</TableHead>
              <TableHead>Published Date</TableHead>
              <TableHead className="w-[300px]">Price & Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.map((listing) => {
              const photos = JSON.parse(listing.photos || "[]");
              const thumbnail = photos[0] || "/placeholder.jpg";
              
              return (
                <TableRow key={listing.id}>
                  <TableCell>
                    <div className="relative w-16 h-12 rounded overflow-hidden bg-gray-100">
                      <Image 
                        src={thumbnail} 
                        alt={listing.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{listing.title}</div>
                    <div className="text-xs text-muted-foreground">{listing.sellerLead.vehicleNumber}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1">
                      <div>Interested: <span className="font-semibold">{listing._count.buyerLeads}</span></div>
                      <div>Visits: <span className="font-semibold">{listing._count.bookings}</span></div>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {listing.publishedAt ? format(new Date(listing.publishedAt), "MMM d, yyyy") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <ListingEditor listing={{ id: listing.id, price: listing.price, status: listing.status }} />
                  </TableCell>
                </TableRow>
              );
            })}
            {listings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No listings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
