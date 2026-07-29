"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserCheck, FileCheck, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNavItems = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard },
  { name: "Seller Leads", href: "/admin/leads/seller", icon: CarFront },
  { name: "Inspectors", href: "/admin/inspectors", icon: UserCheck },
  { name: "Buyer CRM", href: "/admin/leads/buyer", icon: Users },
  { name: "Inspections", href: "/admin/inspections", icon: FileCheck },
  { name: "Listings", href: "/admin/listings", icon: UserCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 flex-shrink-0 border-r min-h-[calc(100vh-4rem)] bg-white hidden md:block">
      <div className="p-4 py-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6 px-4">Admin Panel</h2>
        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 flex-shrink-0 h-5 w-5",
                    isActive ? "text-white" : "text-gray-400"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
