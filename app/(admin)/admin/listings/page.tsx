"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Search, Filter, MoreVertical, Eye, Edit, Trash2,
  Plus, Download, Car, Battery, Gauge, MapPin, Star,
  Users, TrendingUp, CheckCircle, Clock, ShoppingBag, Shield
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
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { useVehicles, type VehicleListing } from "@/hooks/use-api"
import { useToast } from "@/components/ui/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  RESERVED: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  SOLD: "bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
}

export default function ListingsManagement() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("newest")
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<VehicleListing | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      fetch(`/api/vehicles/${id}`, { method: "DELETE" }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] })
      qc.invalidateQueries({ queryKey: ["admin-stats"] })
    },
  })

  const { data: vehiclesData, isLoading } = useVehicles({
    page,
    limit: 10,
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    sortBy,
  })

  const vehicles = vehiclesData?.data ?? []
  const totalPages = vehiclesData?.totalPages ?? 1
  const total = vehiclesData?.total ?? 0

  const stats = [
    { label: "Total Listings", value: total, icon: ShoppingBag, color: "text-primary" },
    { label: "Available", value: vehicles.filter((v) => v.status === "AVAILABLE").length, icon: CheckCircle, color: "text-green-500" },
    { label: "Reserved", value: vehicles.filter((v) => v.status === "RESERVED").length, icon: Clock, color: "text-amber-500" },
    { label: "Sold", value: vehicles.filter((v) => v.status === "SOLD").length, icon: TrendingUp, color: "text-blue-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Listings Management</h1>
          <p className="text-gray-500">Manage all vehicle listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export
          </Button>
        </div>
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
              placeholder="Search listings..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="AVAILABLE">Available</SelectItem>
                <SelectItem value="RESERVED">Reserved</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPage(1) }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
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
                <TableHead>Price</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    </TableCell>
                  </TableRow>
                ))
              ) : vehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No listings found</p>
                  </TableCell>
                </TableRow>
              ) : (
                vehicles.map((v) => {
                  const insp = v.inspection
                  const sl = insp?.sellerLead
                  return (
                    <TableRow key={v.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {v.photos?.[0] ? (
                              <img src={v.photos[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Car className="w-5 h-5 text-gray-400" />
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
                        <span className="font-medium">₹{(v.price / 100000).toFixed(2)}L</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {insp?.batteryHealth != null && (
                            <span className="flex items-center gap-1">
                              <Battery className="w-3 h-3 text-primary" />{Math.round(insp.batteryHealth)}%
                            </span>
                          )}
                          {insp?.warrantyStatus && (
                            <span className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-primary" />{insp.warrantyStatus}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("text-xs", statusColors[v.status] || "")}>{v.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/vehicles/${v.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(v)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 10) + 1}-{Math.min(page * 10, total)} of {total}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  className={page === i + 1 ? "bg-primary text-white" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (!deleteTarget) return
                deleteMutation.mutate(deleteTarget.id, {
                  onSuccess: (data) => {
                    if (data.success) {
                      toast({ title: "Listing Deleted", description: `${deleteTarget.title} has been removed.`, variant: "destructive" })
                    } else {
                      toast({ title: "Error", description: data.error || "Failed to delete", variant: "destructive" })
                    }
                  },
                  onError: () => {
                    toast({ title: "Error", description: "Failed to delete listing", variant: "destructive" })
                  },
                })
                setDeleteTarget(null)
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
