"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Shield, ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardSwitcherProps {
  className?: string
}

export function DashboardSwitcher({ className }: DashboardSwitcherProps) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")
  const isInspector = pathname.startsWith("/inspector")

  return (
    <div className={cn("flex items-center gap-0.5 p-1 rounded-full bg-gray-100 border border-gray-200", className)}>
      <Link
        href="/user"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
          !isAdmin && !isInspector
            ? "bg-white text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        User
      </Link>
      <Link
        href="/admin"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
          isAdmin
            ? "bg-white text-primary shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <Shield className="w-3.5 h-3.5" />
        Admin
      </Link>
      <Link
        href="/inspector"
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
          isInspector
            ? "bg-white text-emerald-600 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        )}
      >
        <ClipboardCheck className="w-3.5 h-3.5" />
        Inspector
      </Link>
    </div>
  )
}
