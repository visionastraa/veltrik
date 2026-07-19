"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, ClipboardCheck, Navigation, BarChart3,
  FileText, Settings, ChevronLeft, ChevronRight, LogOut,
  Bell, Menu, X, MapPin, Zap, Target, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DashboardSwitcher } from "./DashboardSwitcher"

const navItems = [
  { label: "Overview", href: "/inspector", icon: LayoutDashboard },
  { label: "Inspections", href: "/inspector/inspections", icon: ClipboardCheck },
  { label: "Field Ops", href: "/inspector/field", icon: Navigation },
  { label: "Analytics", href: "/inspector/analytics", icon: BarChart3 },
  { label: "Reports", href: "/inspector/reports", icon: FileText },
]

const bottomItems = [
  { label: "Settings", href: "/inspector/settings", icon: Settings },
]

export function InspectorSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/inspector") return pathname === "/inspector"
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={cn("flex items-center gap-3 px-4 py-5 border-b border-gray-200", collapsed && "justify-center px-2")}>
        <Link href="/inspector" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            V
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                Veltrik
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-emerald-300 text-emerald-600 ml-1">
                Inspector
              </Badge>
            </div>
          )}
        </Link>
      </div>

      {/* On Duty Indicator */}
      {!collapsed && (
        <div className="mx-3 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-emerald-700">On Duty</span>
          </div>
          <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
            <MapPin className="w-3 h-3" />
            Delhi NCR Region
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", active && "text-emerald-600")} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors",
              collapsed && "justify-center px-2"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {/* Dashboard Switcher */}
        {!collapsed && (
          <div className="pt-2">
            <DashboardSwitcher className="w-full" />
          </div>
        )}

        {/* User Info */}
        <div className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg", collapsed && "justify-center px-2")}>
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
              {session?.user?.name?.[0] || "I"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-white shadow-lg border"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-[45]"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="lg:hidden fixed top-0 left-0 h-full w-[260px] bg-white border-r z-[50] flex flex-col"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-white border-r transition-all duration-300 flex-shrink-0 sticky top-0",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {sidebarContent}

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-gray-500" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-gray-500" />
          )}
        </button>
      </aside>
    </>
  )
}
