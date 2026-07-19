"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  DollarSign, Car, Users, Clock, TrendingUp, TrendingDown,
  ArrowUp, ArrowDown, Eye, Plus, Download, RefreshCw,
  Bell, Search, CheckCircle, AlertCircle, MessageCircle,
  BarChart3, Settings, ChevronRight, Calendar, Activity,
  Battery, Zap, Shield, FileText, User, ClipboardCheck
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAdminStats } from "@/hooks/use-admin-api"
import { cn } from "@/lib/utils"

// ---------- Types ----------
interface StatCard {
  label: string
  value: string | number
  change: string
  trend: "up" | "down" | "neutral"
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// ---------- Revenue Chart ----------
const RevenueChart = () => {
  const data = [
    { month: "Jan", value: 1200000 },
    { month: "Feb", value: 1500000 },
    { month: "Mar", value: 1800000 },
    { month: "Apr", value: 1400000 },
    { month: "May", value: 2100000 },
    { month: "Jun", value: 2500000 },
    { month: "Jul", value: 2800000 },
    { month: "Aug", value: 3000000 },
    { month: "Sep", value: 2700000 },
    { month: "Oct", value: 3200000 },
    { month: "Nov", value: 3500000 },
    { month: "Dec", value: 4000000 },
  ]
  const max = Math.max(...data.map((d) => d.value))

  return (
    <div className="h-64 w-full relative">
      <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#16A34A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`
            ${data
              .map((d, i) => {
                const x = (i / (data.length - 1)) * 780 + 10
                const y = 190 - (d.value / max) * 180
                return `${x},${y}`
              })
              .join(" ")}
            790,190 10,190
          `}
          fill="url(#revGrad)"
        />
        <polyline
          points={data
            .map((d, i) => {
              const x = (i / (data.length - 1)) * 780 + 10
              const y = 190 - (d.value / max) * 180
              return `${x},${y}`
            })
            .join(" ")}
          fill="none"
          stroke="#16A34A"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 780 + 10
          const y = 190 - (d.value / max) * 180
          return <circle key={i} cx={x} cy={y} r="4" fill="#16A34A" className="cursor-pointer hover:r-6 transition-all" />
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
        {data.map((d) => (
          <span key={d.month}>{d.month}</span>
        ))}
      </div>
    </div>
  )
}

// ---------- Stats Card ----------
const StatsCard = ({ stat }: { stat: StatCard }) => (
  <motion.div whileHover={{ y: -4 }} className="group">
    <Card className="p-4 border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary/5 to-transparent rounded-full -mr-10 -mt-10" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <div
              className={cn(
                "flex items-center gap-1 text-xs mt-1",
                stat.trend === "up" ? "text-green-500" : stat.trend === "down" ? "text-red-500" : "text-gray-400"
              )}
            >
              {stat.trend === "up" && <ArrowUp className="w-3 h-3" />}
              {stat.trend === "down" && <ArrowDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
          <div className={cn("p-3 rounded-lg bg-opacity-10 transition-colors group-hover:bg-opacity-20", stat.color.replace("text", "bg") + "/10")}>
            <stat.icon className={cn("w-5 h-5", stat.color)} />
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
)

// ---------- Pending Tasks ----------
const pendingTasks = [
  { label: "Inspections to Review", count: 12, total: 20, color: "bg-red-500", due: "Today" },
  { label: "Listings to Approve", count: 8, total: 15, color: "bg-amber-500", due: "Tomorrow" },
  { label: "Buyer Follow-ups", count: 15, total: 25, color: "bg-blue-500", due: "2 days" },
  { label: "Seller Leads", count: 5, total: 10, color: "bg-green-500", due: "3 days" },
]

// ---------- MAIN ----------
export default function AdminOverview() {
  const { data: session } = useSession()
  const { data: stats, isLoading } = useAdminStats()
  const [timeframe, setTimeframe] = useState("monthly")

  const statCards: StatCard[] = [
    {
      label: "Total Revenue",
      value: stats?.totalRevenue ? `₹${(stats.totalRevenue / 100000).toFixed(1)}L` : "₹0",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      label: "Active Listings",
      value: stats?.totalListings ?? 0,
      change: "+18",
      trend: "up",
      icon: Car,
      color: "text-blue-500",
    },
    {
      label: "Total Inspections",
      value: stats?.totalInspections ?? 0,
      change: "+5",
      trend: "up",
      icon: ClipboardCheck,
      color: "text-amber-500",
    },
    {
      label: "Seller Leads",
      value: stats?.totalLeads ?? 0,
      change: "+8",
      trend: "up",
      icon: Users,
      color: "text-purple-500",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            Dashboard
            <Badge className="bg-primary/20 text-primary border-0 ml-2">Admin</Badge>
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {session?.user?.name || "Admin"}! Here&apos;s what&apos;s happening today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search..." className="pl-10 w-48" />
          </div>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Link href="/admin/listings">
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <Plus className="w-4 h-4 mr-2" /> New Listing
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  5
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(stats?.recentActivity ?? []).slice(0, 4).map((a) => (
                <DropdownMenuItem key={a.id} className="flex items-start gap-3 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{a.action}</p>
                    <p className="text-xs text-gray-500">{a.description}</p>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-primary">View All</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatsCard key={i} stat={stat} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <Card className="p-6 border-0 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Revenue Overview</h2>
                <p className="text-sm text-gray-500">Monthly revenue trends</p>
              </div>
              <Tabs value={timeframe} onValueChange={setTimeframe} className="w-auto">
                <TabsList>
                  <TabsTrigger value="weekly">Week</TabsTrigger>
                  <TabsTrigger value="monthly">Month</TabsTrigger>
                  <TabsTrigger value="yearly">Year</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <RevenueChart />
          </Card>

          {/* Recent Listings */}
          <Card className="p-6 border-0 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Listings</h2>
              <Link href="/admin/listings">
                <Button variant="ghost" size="sm" className="text-primary">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))
              ) : (stats?.recentListings ?? []).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No listings yet</p>
              ) : (
                (stats?.recentListings ?? []).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{listing.title}</p>
                        <p className="text-xs text-gray-500">
                          ₹{(listing.price / 100000).toFixed(2)}L
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "text-xs",
                        listing.status === "AVAILABLE"
                          ? "bg-green-100 text-green-600"
                          : listing.status === "SOLD"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-amber-100 text-amber-600"
                      )}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Tasks */}
          <Card className="p-6 border-0 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Pending Tasks</h3>
              <Badge variant="outline" className="text-primary">Action Required</Badge>
            </div>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.label} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", task.color)} />
                      <span className="text-gray-600">{task.label}</span>
                    </div>
                    <span className="font-medium">
                      {task.count}/{task.total}
                    </span>
                  </div>
                  <Progress value={(task.count / task.total) * 100} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-sm bg-white">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/admin/listings">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" /> Listings
                </Button>
              </Link>
              <Link href="/admin/inspections">
                <Button variant="outline" className="w-full justify-start">
                  <ClipboardCheck className="w-4 h-4 mr-2" /> Inspections
                </Button>
              </Link>
              <Link href="/admin/leads/seller">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" /> Seller Leads
                </Button>
              </Link>
              <Link href="/admin/leads/buyer">
                <Button variant="outline" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" /> Buyer Leads
                </Button>
              </Link>
            </div>
          </Card>

          {/* Activity Feed */}
          <Card className="p-6 border-0 shadow-sm bg-white">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                ))
              ) : (stats?.recentActivity ?? []).length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No activity yet</p>
              ) : (
                (stats?.recentActivity ?? []).slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}


