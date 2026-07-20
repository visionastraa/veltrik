"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Calendar, Clock, MapPin, User, Battery, Zap, CheckCircle,
  XCircle, AlertCircle, ArrowUp, ArrowDown, Search, Filter,
  MoreVertical, Eye, Play, Timer, Award, Star, RefreshCw,
  Bell, Navigation, FileText, BarChart3, Plus, Camera,
  MessageCircle, Phone, Car, Activity, Target
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Inspection {
  id: string
  sellerName: string
  vehicle: string
  time: string
  date: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  batteryHealth: number
  location: string
  phone: string
  address: string
  duration: number
  priority: "high" | "medium" | "low"
  notes?: string
  vehicleDetails: {
    make: string
    model: string
    year: number
    variant: string
    kmDriven: number
    registration: string
  }
}

const todayInspections: Inspection[] = [
  {
    id: "INS-001",
    sellerName: "Rahul Sharma",
    vehicle: "Tesla Model 3 Long Range",
    time: "10:00 AM",
    date: "Today",
    status: "scheduled",
    batteryHealth: 87,
    location: "Delhi, India",
    phone: "+91 98765 43210",
    address: "123, Green Park, Delhi",
    duration: 45,
    priority: "high",
    notes: "Customer wants full inspection report",
    vehicleDetails: { make: "Tesla", model: "Model 3", year: 2024, variant: "Long Range", kmDriven: 8500, registration: "KA05AM9207" },
  },
  {
    id: "INS-002",
    sellerName: "Priya Singh",
    vehicle: "BYD Atto 3 Premium",
    time: "11:30 AM",
    date: "Today",
    status: "scheduled",
    batteryHealth: 92,
    location: "Gurgaon, India",
    phone: "+91 98765 43211",
    address: "45, Cyber City, Gurgaon",
    duration: 60,
    priority: "medium",
    vehicleDetails: { make: "BYD", model: "Atto 3", year: 2024, variant: "Premium", kmDriven: 12000, registration: "HR26AM1234" },
  },
  {
    id: "INS-003",
    sellerName: "Amit Patel",
    vehicle: "Hyundai Ioniq 5",
    time: "2:00 PM",
    date: "Today",
    status: "in_progress",
    batteryHealth: 78,
    location: "Noida, India",
    phone: "+91 98765 43212",
    address: "78, Sector 62, Noida",
    duration: 45,
    priority: "high",
    notes: "Suspected battery issue",
    vehicleDetails: { make: "Hyundai", model: "Ioniq 5", year: 2023, variant: "Signature", kmDriven: 25000, registration: "UP16AM5678" },
  },
  {
    id: "INS-004",
    sellerName: "Vikram Reddy",
    vehicle: "Tata Nexon EV Max",
    time: "3:30 PM",
    date: "Today",
    status: "scheduled",
    batteryHealth: 85,
    location: "Faridabad, India",
    phone: "+91 98765 43213",
    address: "56, Sector 15, Faridabad",
    duration: 30,
    priority: "low",
    vehicleDetails: { make: "Tata", model: "Nexon EV Max", year: 2024, variant: "Max", kmDriven: 5000, registration: "HR51AM9012" },
  },
]

const stats = [
  { label: "Today's Inspections", value: "6", change: "+2", trend: "up" as const, icon: Calendar, color: "text-blue-500" },
  { label: "Completed", value: "3", change: "50%", trend: "up" as const, icon: CheckCircle, color: "text-green-500" },
  { label: "In Progress", value: "1", change: "-1", trend: "down" as const, icon: Clock, color: "text-amber-500" },
  { label: "Avg. Time", value: "43 min", change: "-5 min", trend: "up" as const, icon: Timer, color: "text-purple-500" },
  { label: "Avg. Rating", value: "4.9", change: "★", trend: "up" as const, icon: Star, color: "text-yellow-500" },
  { label: "Quality Score", value: "96%", change: "+2%", trend: "up" as const, icon: Award, color: "text-emerald-500" },
]

const activities = [
  { id: "1", type: "completed" as const, title: "Completed inspection for Tesla Model 3", time: "2 hours ago", vehicle: "Tesla Model 3" },
  { id: "2", type: "started" as const, title: "Started inspection for BYD Atto 3", time: "4 hours ago", vehicle: "BYD Atto 3" },
  { id: "3", type: "photo" as const, title: "Uploaded 8 photos for Hyundai Ioniq 5", time: "5 hours ago", vehicle: "Hyundai Ioniq 5" },
  { id: "4", type: "issue" as const, title: "Reported issue: Battery degradation on Tata Nexon", time: "1 day ago", vehicle: "Tata Nexon EV" },
]

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good Morning"
  if (h < 17) return "Good Afternoon"
  return "Good Evening"
}

function StatCard({ stat }: { stat: typeof stats[0] }) {
  return (
    <motion.div whileHover={{ y: -4 }} className="group min-w-0">
      <Card className="p-4 h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider truncate">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
            <div className={cn("flex items-center gap-1 text-xs mt-1", stat.trend === "up" ? "text-green-500" : "text-red-500")}>
              {stat.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
          <div className={cn("p-3 rounded-lg flex-shrink-0", stat.color.replace("text", "bg") + "/10")}>
            <stat.icon className={cn("w-5 h-5", stat.color)} />
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

function ScheduleTimeline({ inspections }: { inspections: Inspection[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {inspections.map((insp, i) => (
        <motion.div key={insp.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative">
          <div className={cn("flex items-start gap-4 p-4 rounded-xl transition-all duration-300", insp.status === "in_progress" ? "bg-emerald-50 border border-emerald-200" : "bg-gray-50/50 hover:bg-gray-50")}>
            {/* Time */}
            <div className="min-w-[80px] text-center">
              <p className="text-lg font-semibold text-gray-900">{insp.time}</p>
              <p className="text-xs text-gray-400">{insp.date}</p>
            </div>

            {/* Timeline Dot */}
            <div className="flex flex-col items-center pt-1">
              <div className={cn("w-3 h-3 rounded-full", insp.status === "completed" ? "bg-green-500" : insp.status === "in_progress" ? "bg-blue-500 animate-pulse" : insp.status === "cancelled" ? "bg-red-500" : "bg-gray-300")} />
              {i < inspections.length - 1 && <div className="w-0.5 h-12 bg-gray-200" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{insp.vehicle}</h3>
                    <Badge variant={insp.status === "scheduled" ? "outline" : insp.status === "in_progress" ? "default" : insp.status === "completed" ? "secondary" : "destructive"}>
                      {insp.status === "in_progress" ? "In Progress" : insp.status.charAt(0).toUpperCase() + insp.status.slice(1)}
                    </Badge>
                    {insp.priority === "high" && (
                      <Badge className="bg-red-100 text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" /> High Priority
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {insp.sellerName}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {insp.location}</span>
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-emerald-500" /> {insp.batteryHealth}%</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {insp.duration} min</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link href={`/inspector/inspect/${insp.id}`}>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white whitespace-nowrap">
                      {insp.status === "in_progress" ? <><Eye className="w-3 h-3 mr-1" /> Continue</> : <><Play className="w-3 h-3 mr-1" /> Start</>}
                    </Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="w-4 h-4 mr-2" /> Quick View</DropdownMenuItem>
                      <DropdownMenuItem><Phone className="w-4 h-4 mr-2" /> Call Seller</DropdownMenuItem>
                      <DropdownMenuItem><MessageCircle className="w-4 h-4 mr-2" /> Message</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600"><XCircle className="w-4 h-4 mr-2" /> Cancel</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Expanded */}
              <AnimatePresence>
                {expandedId === insp.id && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium">Vehicle Details</p>
                        <div className="space-y-1 mt-1">
                          <div className="flex justify-between"><span className="text-gray-500">Make/Model</span><span>{insp.vehicleDetails.make} {insp.vehicleDetails.model}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Year</span><span>{insp.vehicleDetails.year}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Variant</span><span>{insp.vehicleDetails.variant}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">KM Driven</span><span>{insp.vehicleDetails.kmDriven.toLocaleString()} km</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Registration</span><span>{insp.vehicleDetails.registration}</span></div>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium">Contact Information</p>
                        <div className="space-y-1 mt-1">
                          <div className="flex justify-between"><span className="text-gray-500">Name</span><span>{insp.sellerName}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{insp.phone}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Address</span><span className="text-right text-xs">{insp.address}</span></div>
                        </div>
                        {insp.notes && (
                          <div className="mt-2 p-2 bg-amber-50 rounded-lg">
                            <p className="text-xs text-amber-600">{insp.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1"><Navigation className="w-3 h-3 mr-1" /> Navigate</Button>
                      <Link href={`/inspector/inspect/${insp.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full"><FileText className="w-3 h-3 mr-1" /> Start Inspection</Button>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {expandedId !== insp.id && (
                <button onClick={() => setExpandedId(insp.id)} className="text-xs text-emerald-600 hover:underline mt-1">
                  Show Details
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ActivityFeed({ items }: { items: typeof activities }) {
  const getIcon = (type: typeof activities[0]["type"]) => {
    switch (type) {
      case "started": return <Play className="w-4 h-4 text-blue-500" />
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "issue": return <AlertCircle className="w-4 h-4 text-red-500" />
      case "photo": return <Camera className="w-4 h-4 text-purple-500" />
    }
  }
  return (
    <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Recent Activity</h3>
        <Button variant="ghost" size="sm">View All</Button>
      </div>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className="flex items-start gap-3 text-sm">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">{getIcon(a.type)}</div>
            <div className="flex-1">
              <p className="font-medium">{a.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{a.vehicle}</span><span>·</span><span>{a.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function InspectorDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [inspections] = useState(todayInspections)

  const filtered = inspections.filter((i) =>
    (i.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) || i.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) || i.location.toLowerCase().includes(searchQuery.toLowerCase()))
  ).filter((i) => filterStatus === "all" || i.status === filterStatus)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] || "Inspector"}! 👋
            <Badge className="bg-emerald-100 text-emerald-700 border-0 ml-2">On Duty</Badge>
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Delhi NCR</span>
            <span>·</span>
            <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search inspections..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 w-48" />
          </div>
          <Button variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">3</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => <StatCard key={i} stat={s} />)}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Schedule */}
        <div className="lg:col-span-2">
          <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
                <p className="text-sm text-gray-500">You have {filtered.length} inspections today</p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36 h-8"><SelectValue placeholder="Filter" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <ScheduleTimeline inspections={filtered} />
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start" asChild>
                <Link href="/inspector/inspect/new"><Plus className="w-4 h-4 mr-2" /> New Inspection</Link>
              </Button>
              <Button variant="outline" className="justify-start"><FileText className="w-4 h-4 mr-2" /> View History</Button>
              <Button variant="outline" className="justify-start"><Navigation className="w-4 h-4 mr-2" /> Today&apos;s Route</Button>
              <Button variant="outline" className="justify-start"><BarChart3 className="w-4 h-4 mr-2" /> Performance</Button>
            </div>
          </Card>

          {/* Progress */}
          <Card className="p-6 border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <h3 className="font-semibold mb-4">Today&apos;s Progress</h3>
            <div className="space-y-4">
              <div><div className="flex justify-between text-sm mb-1"><span>Scheduled</span><span className="font-medium">4</span></div><Progress value={33} className="h-2" /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>In Progress</span><span className="font-medium">1</span></div><Progress value={16} className="h-2" /></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Completed</span><span className="font-medium">3</span></div><Progress value={50} className="h-2" /></div>
            </div>
          </Card>

          {/* Activity */}
          <ActivityFeed items={activities} />

          {/* Status Widget */}
          <Card className="p-4 border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Current Status</p>
                <p className="font-medium">On Schedule</p>
                <p className="text-xs text-emerald-600">Next inspection in 15 min</p>
              </div>
              <div className="text-center">
                <div className="text-2xl">🌤</div>
                <p className="text-xs text-gray-500">28°C Clear</p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Navigation className="w-3 h-3 mr-1" /> Route</Button>
              <Button variant="outline" size="sm" className="flex-1"><MessageCircle className="w-3 h-3 mr-1" /> Support</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
