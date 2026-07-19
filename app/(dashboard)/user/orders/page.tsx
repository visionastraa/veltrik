"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package, Search, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileText, Download, Phone, MapPin, Shield, Palette, Hash, Car,
  FileCheck, FileLock, FileWarning, ArrowLeft, Home
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const MOCK_ORDERS = [
  {
    id: "ORD-2024-001",
    vehicle: "Tata Nexon EV Max",
    date: "2024-11-15",
    price: 1749000,
    dealer: "VoltEV Motors, Pune",
    dealerPhone: "+91 98765 43210",
    status: "delivered" as const,
    variant: "XZ+ Lux",
    color: "Arctic White",
    warranty: "5 Years / 1,00,000 km",
    deliveredAt: "2024-12-20",
    trackingSteps: [
      { label: "Order Confirmed", done: true, date: "Nov 15" },
      { label: "Vehicle Ready", done: true, date: "Nov 28" },
      { label: "Shipped", done: true, date: "Dec 5" },
      { label: "Delivered", done: true, date: "Dec 20" },
    ],
  },
  {
    id: "ORD-2024-002",
    vehicle: "MG ZS EV 2024",
    date: "2024-12-01",
    price: 2199000,
    dealer: "ElectricHub, Mumbai",
    dealerPhone: "+91 87654 32109",
    status: "shipped" as const,
    variant: "Exclusive Pro",
    color: "Copenhagen Blue",
    warranty: "5 Years / Unlimited km",
    deliveredAt: null,
    trackingSteps: [
      { label: "Order Confirmed", done: true, date: "Dec 1" },
      { label: "Vehicle Ready", done: true, date: "Dec 10" },
      { label: "Shipped", done: true, date: "Dec 18" },
      { label: "Delivered", done: false, date: "Est. Dec 28" },
    ],
  },
  {
    id: "ORD-2025-003",
    vehicle: "Hyundai Ioniq 5",
    date: "2025-01-05",
    price: 4495000,
    dealer: "GreenDrive Delhi",
    dealerPhone: "+91 76543 21098",
    status: "processing" as const,
    variant: "Prestige LR AWD",
    color: "Titan Grey",
    warranty: "8 Years / 1,60,000 km",
    deliveredAt: null,
    trackingSteps: [
      { label: "Order Confirmed", done: true, date: "Jan 5" },
      { label: "Vehicle Ready", done: false, date: "Est. Jan 20" },
      { label: "Shipped", done: false, date: "Est. Jan 25" },
      { label: "Delivered", done: false, date: "Est. Feb 1" },
    ],
  },
]

const STATUS_CONFIG = {
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  shipped: { label: "Shipped", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
}

const DOCUMENTS = [
  { name: "Invoice", icon: FileText },
  { name: "Registration", icon: FileCheck },
  { name: "Insurance", icon: Shield },
  { name: "Warranty Card", icon: FileWarning },
]

function StatusBadge({ status }: { status: keyof typeof STATUS_CONFIG }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cfg.color)}>
      <cfg.icon className="w-3 h-3 mr-1" />
      {cfg.label}
    </Badge>
  )
}

function TrackingTimeline({ steps }: { steps: typeof MOCK_ORDERS[0]["trackingSteps"] }) {
  const completedCount = steps.filter(s => s.done).length
  const progress = (completedCount / steps.length) * 100

  return (
    <div className="space-y-3">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex flex-col items-center text-center flex-1">
            <div className={cn(
              "w-3 h-3 rounded-full mb-1",
              step.done ? "bg-primary" : "bg-gray-300"
            )} />
            <p className={cn("text-[10px] leading-tight", step.done ? "text-foreground font-medium" : "text-gray-400")}>
              {step.label}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">{step.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: typeof MOCK_ORDERS[0] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white rounded-xl">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 text-2xl">
            <Car className="w-7 h-7 text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{order.vehicle}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{order.id}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
              <span>{new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="font-semibold text-foreground">₹{(order.price / 100000).toFixed(2)}L</span>
              <span className="truncate max-w-[160px]">{order.dealer.split(",")[0]}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusBadge status={order.status} />
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="border-t px-4 py-4 space-y-4">
              <TrackingTimeline steps={order.trackingSteps} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-3.5 h-3.5" />{order.dealer}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Phone className="w-3.5 h-3.5" />{order.dealerPhone}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Hash className="w-3.5 h-3.5" />{order.variant}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-gray-600"><Palette className="w-3.5 h-3.5" />{order.color}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Shield className="w-3.5 h-3.5" />{order.warranty}</div>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {DOCUMENTS.map((doc) => (
                    <Button key={doc.name} variant="outline" size="sm" className="text-xs h-8">
                      <doc.icon className="w-3.5 h-3.5 mr-1.5" />
                      {doc.name}
                      <Download className="w-3 h-3 ml-1.5 text-gray-400" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}

export default function OrdersPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const orders = MOCK_ORDERS.filter(o =>
    o.vehicle.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all: orders.length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
  }

  const stats = [
    { label: "Total Orders", value: MOCK_ORDERS.length, color: "text-foreground", bg: "bg-gray-100", icon: Package },
    { label: "Processing", value: counts.processing, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
    { label: "Shipped", value: counts.shipped, color: "text-blue-600", bg: "bg-blue-50", icon: Truck },
    { label: "Delivered", value: counts.delivered, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  ]

  const renderTab = (filter: string | null) => {
    const list = filter ? orders.filter(o => o.status === filter) : orders
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3" />
          <p>No {filter ? filter + " " : ""}orders found</p>
        </div>
      )
    }
    return <div className="space-y-3">{list.map(o => <OrderCard key={o.id} order={o} />)}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/user">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Home className="w-3 h-3" />
                  Dashboard
                </Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">Orders</span>
              </div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="w-6 h-6" />Your Orders
              </h1>
              <p className="text-gray-500">Track deliveries and manage your purchases</p>
            </div>
          </div>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="sm:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Card className="p-4 border-0 shadow-sm bg-white rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.bg)}>
                    <s.icon className={cn("w-5 h-5", s.color)} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-gray-500">{s.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
            <TabsTrigger value="processing">Processing ({counts.processing})</TabsTrigger>
            <TabsTrigger value="shipped">Shipped ({counts.shipped})</TabsTrigger>
            <TabsTrigger value="delivered">Delivered ({counts.delivered})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">{renderTab(null)}</TabsContent>
          <TabsContent value="processing" className="mt-4">{renderTab("processing")}</TabsContent>
          <TabsContent value="shipped" className="mt-4">{renderTab("shipped")}</TabsContent>
          <TabsContent value="delivered" className="mt-4">{renderTab("delivered")}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
