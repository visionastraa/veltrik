import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Activity, CarFront, FileCheck, Users, CheckCircle2 } from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (!session || !["ADMIN", "MANAGER"].includes(role)) {
    redirect("/login");
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    acquiredThisMonth,
    activeListings,
    pendingInspections,
    buyerLeads,
    followUpRequired,
    recentActivitySeller,
    recentActivityBuyer
  ] = await Promise.all([
    prisma.sellerLead.count({
      where: { status: "ACQUIRED", updatedAt: { gte: startOfMonth } },
    }),
    prisma.listing.count({
      where: { status: "AVAILABLE" },
    }),
    prisma.sellerLead.count({
      where: { status: "SCHEDULED" },
    }),
    prisma.buyerLead.count(),
    prisma.buyerLead.count({
      where: { status: "FOLLOW_UP_REQUIRED" },
    }),
    prisma.sellerLead.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true } } }
    }),
    prisma.buyerLead.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { user: { select: { name: true } } }
    })
  ]);

  const activity = [
    ...recentActivitySeller.map(l => ({
      id: l.id,
      type: "SELLER",
      title: `${l.make} ${l.model}`,
      user: l.user.name || "Unknown",
      status: l.status,
      date: l.updatedAt
    })),
    ...recentActivityBuyer.map(l => ({
      id: l.id,
      type: "BUYER",
      title: "Interest shown",
      user: l.user.name || "Unknown",
      status: l.status,
      date: l.updatedAt
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acquired (This Month)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{acquiredThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <CarFront className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeListings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Inspections</CardTitle>
            <FileCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInspections}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Follow-Up Required</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{followUpRequired}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of {buyerLeads} total leads</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs text-muted-foreground">User: {item.user} • {item.type}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={item.status} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">No recent activity.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
