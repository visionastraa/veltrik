"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search, Filter, MoreVertical, Eye, Clock, CheckCircle,
  XCircle, Car, Battery, Gauge, MapPin, Star, Calendar,
  User, Download, ClipboardCheck, AlertCircle, Award
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { useVehicles, type VehicleListing } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

export default function InspectionsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // We use vehicles as a proxy for inspections since each listing has an inspection
  const { data: vehiclesData, isLoading } = useVehicles({ limit: 50 })
  const vehicles = vehiclesData?.data ?? []

  // Filter vehicles that have inspections
  const inspections = vehicles.filter((v) => v.inspection)

  const filtered = inspections.filter((v) => {
    const insp = v.inspection
    const sl = insp?.sellerLead
    const matchesSearch =
      !searchQuery ||
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${sl?.make} ${sl?.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const stats = [
    { label: "Total Inspections", value: filtered.length, icon: ClipboardCheck, color: "text-primary" },
    { label: "With Final Offer", value: filtered.filter((v) => v.inspection.finalOffer).length, icon: CheckCircle, color: "text-green-500" },
    { label: "Pending Offer", value: filtered.filter((v) => !v.inspection.finalOffer).length, icon: Clock, color: "text-amber-500" },
    { label: "Listed", value: filtered.filter((v) => v.status === "AVAILABLE").length, icon: Award, color: "text-blue-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inspection Reviews</h1>
          <p className="text-gray-500">Review and manage vehicle inspections</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-4 border-0 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg">
                <s.icon className={cn("w-5 h-5", s.color)} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search inspections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Inspection Score</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Offer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><div className="h-16 bg-gray-100 rounded-lg animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No inspections found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((v) => {
                  const insp = v.inspection
                  const sl = insp?.sellerLead
                  const score = insp?.testDriveRating
                    ? Math.round((insp.testDriveRating / 10) * 100)
                    : null
                  return (
                    <TableRow key={v.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {v.photos?.[0] ? (
                              <img src={v.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Car className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{v.title}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              {sl && (
                                <>
                                  <span>{sl.year}</span>
                                  <span>-</span>
                                  <span>{sl.kmDriven.toLocaleString()} km</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {score !== null ? (
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                              score >= 80 ? "bg-green-100 text-green-600" :
                              score >= 60 ? "bg-amber-100 text-amber-600" :
                              "bg-red-100 text-red-600"
                            )}>
                              {score}
                            </div>
                            <span className="text-xs text-gray-500">
                              {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          {insp?.batteryHealth != null && (
                            <div className="flex items-center gap-1 text-sm">
                              <Battery className="w-3 h-3 text-primary" />
                              <span>{Math.round(insp.batteryHealth)}%</span>
                            </div>
                          )}
                          {insp?.batteryCharge != null && (
                            <p className="text-xs text-gray-500">Charge: {Math.round(insp.batteryCharge)}%</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {insp?.finalOffer ? (
                          <span className="font-medium text-primary">
                            ₹{(insp.finalOffer / 100000).toFixed(2)}L
                          </span>
                        ) : (
                          <span className="text-gray-400">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-xs",
                          v.status === "AVAILABLE" ? "bg-green-100 text-green-600" :
                          v.status === "RESERVED" ? "bg-amber-100 text-amber-600" :
                          v.status === "SOLD" ? "bg-gray-100 text-gray-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          {v.status === "AVAILABLE" ? "Listed" : v.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/vehicles/${v.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
