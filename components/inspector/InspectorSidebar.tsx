"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, Calendar, History, Shield, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/inspector", icon: LayoutDashboard },
  { name: "Inspections", href: "/inspector/inspections", icon: ClipboardCheck },
  { name: "Calendar", href: "/inspector/calendar", icon: Calendar },
  { name: "History", href: "/inspector/history", icon: History },
];

export default function InspectorSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile/Tablet Header Toggle */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center gap-2 font-bold text-foreground">
          <Shield className="size-5 text-primary" />
          <span>Veltrik Inspector</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Top Branding (Desktop) */}
        <div className="hidden lg:flex items-center gap-3 px-6 h-16 border-b border-border">
          <Shield className="size-6 text-primary" />
          <span className="font-bold text-lg text-foreground tracking-tight">Veltrik Inspector</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4.5 shrink-0" />
                <span>{item.name}</span>
                {isActive && (
                  <span className="absolute right-0 top-0 bottom-0 w-1 bg-primary-foreground/40 rounded-l-md" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Backdrop overlay for Mobile/Tablet */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-xs lg:hidden"
        />
      )}
    </>
  );
}
