"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Package, Search, Truck, CheckCircle2, Clock, ChevronDown, ChevronUp,
  FileText, Download, Phone, MapPin, Shield, Palette, Hash, Car,
  FileCheck, FileLock, FileWarning, ArrowLeft, Home, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { useOrders } from "@/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const DOCUMENTS = [
  { name: "Invoice", icon: FileText },
  { name: "Registration", icon: FileCheck },
  { name: "Insurance", icon: Shield },
  { name: "Warranty Card", icon: FileWarning },
]

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  created: { label: "Processing", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  paid: { label: "Completed", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  failed: { label: "Failed", color: "bg-red-100 text-red-700 border-red-200", icon: Truck },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status]
  if (!cfg) return <Badge variant="outline">{status}</Badge>
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cfg.color)}>
      <cfg.icon className="w-3 h-3 mr-1" />
      {cfg.label}
    </Badge>
  )
}

function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()

  return (
    <Card className="overflow-hidden border-0 shadow-sm bg-white rounded-xl">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 text-2xl">
            <Car className="w-7 h-7 text-gray-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{order.id}</h3>
            <p className="text-xs text-gray-400 mt-0.5">Order #{order.razorpayOrderId?.slice(-8) || "N/A"}</p>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
              <span>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              <span className="font-semibold text-foreground">₹{(order.amount / 100).toFixed(2)}</span>
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
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Order ID</p>
                  <p className="font-medium">{order.razorpayOrderId || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Payment ID</p>
                  <p className="font-medium">{order.razorpayPaymentId || "N/A"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Documents</p>
                <div className="flex flex-wrap gap-2">
                  {DOCUMENTS.map((doc) => (
                    <Button key={doc.name} variant="outline" size="sm" className="text-xs h-8" onClick={() => toast({ title: "Coming Soon", description: `${doc.name} download will be available shortly.` })}>
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
  const { data, isLoading } = useOrders()

  const orders = (data?.data ?? []).filter((o: any) =>
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.razorpayOrderId?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = {
    all: orders.length,
    processing: orders.filter((o: any) => o.status === "created").length,
    completed: orders.filter((o: any) => o.status === "paid").length,
    failed: orders.filter((o: any) => o.status === "failed").length,
  }

  const stats = [
    { label: "Total Orders", value: orders.length, color: "text-foreground", bg: "bg-gray-100", icon: Package },
    { label: "Processing", value: counts.processing, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
    { label: "Completed", value: counts.completed, color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
    { label: "Failed", value: counts.failed, color: "text-red-600", bg: "bg-red-50", icon: Truck },
  ]

  const renderTab = (filter: string | null) => {
    const list = filter ? orders.filter((o: any) => o.status === filter) : orders
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )
    }
    if (list.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3" />
          <p>No {filter ? filter + " " : ""}orders found</p>
        </div>
      )
    }
    return <div className="space-y-3">{list.map((o: any) => <OrderCard key={o.id} order={o} />)}</div>
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
              <p className="text-gray-500">Track your purchases</p>
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
            <TabsTrigger value="created">Processing ({counts.processing})</TabsTrigger>
            <TabsTrigger value="paid">Completed ({counts.completed})</TabsTrigger>
            <TabsTrigger value="failed">Failed ({counts.failed})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">{renderTab(null)}</TabsContent>
          <TabsContent value="created" className="mt-4">{renderTab("created")}</TabsContent>
          <TabsContent value="paid" className="mt-4">{renderTab("paid")}</TabsContent>
          <TabsContent value="failed" className="mt-4">{renderTab("failed")}</TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
