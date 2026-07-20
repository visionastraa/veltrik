"use client"

import { useState } from "react"
import {
  Search, Filter, MoreVertical, Eye, Phone, Mail,
  Calendar, Clock, CheckCircle, XCircle, Users,
  DollarSign, Download, ChevronRight, Battery, Car, MapPin
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
import { Label } from "@/components/ui/label"
import { useAdminSellerLeads, useAdminApprove, useAdminReject, type SellerLeadData } from "@/hooks/use-admin-api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-600",
  SCHEDULED: "bg-amber-100 text-amber-600",
  INSPECTED: "bg-purple-100 text-purple-600",
  OFFER_MADE: "bg-indigo-100 text-indigo-600",
  ACQUIRED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
}

const statusLabels: Record<string, string> = {
  SUBMITTED: "Submitted",
  SCHEDULED: "Scheduled",
  INSPECTED: "Inspected",
  OFFER_MADE: "Offer Made",
  ACQUIRED: "Acquired",
  REJECTED: "Rejected",
}

export default function SellerLeadsPage() {
  const { toast } = useToast()
  const { data, isLoading } = useAdminSellerLeads()
  const approveMutation = useAdminApprove()
  const rejectMutation = useAdminReject()

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<SellerLeadData | null>(null)
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")

  const leads = (data?.data ?? []).filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${lead.make} ${lead.model}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleApprove = async (lead: SellerLeadData) => {
    setSelectedLead(lead)
    setOfferAmount(String(lead.expectedPrice))
    setIsOfferDialogOpen(true)
  }

  const submitOffer = async () => {
    if (!selectedLead) return
    const lead = leads.find((l) => l.id === selectedLead.id)
    if (!lead) return
    if (!lead.inspection?.id) {
      toast({ title: "Error", description: "No inspection found for this lead. Please complete inspection first.", variant: "destructive" })
      return
    }

    approveMutation.mutate(
      { inspectionId: lead.inspection.id, offerPrice: Number(offerAmount) },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast({ title: "Offer Submitted", description: `₹${Number(offerAmount).toLocaleString()} offer sent to ${lead.user.name}` })
            setIsOfferDialogOpen(false)
            setOfferAmount("")
          } else {
            toast({ title: "Error", description: data.error || "Failed to submit offer", variant: "destructive" })
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to submit offer", variant: "destructive" })
        },
      }
    )
  }

  const handleReject = async (lead: SellerLeadData) => {
    await rejectMutation.mutateAsync({ sellerLeadId: lead.id })
    toast({ title: "Lead Rejected", description: `${lead.user.name}'s lead has been rejected.`, variant: "destructive" })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Seller Leads</h1>
          <p className="text-gray-500">Manage all seller submissions</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Leads</p>
              <p className="text-2xl font-bold">{leads.length}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg"><Users className="w-5 h-5 text-primary" /></div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Review</p>
              <p className="text-2xl font-bold text-amber-600">{leads.filter((l) => l.status === "SUBMITTED").length}</p>
            </div>
            <div className="p-2 bg-amber-50 rounded-lg"><Clock className="w-5 h-5 text-amber-500" /></div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Acquired</p>
              <p className="text-2xl font-bold text-green-600">{leads.filter((l) => l.status === "ACQUIRED").length}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-500" /></div>
          </div>
        </Card>
        <Card className="p-4 border-0 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{leads.filter((l) => l.status === "REJECTED").length}</p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg"><XCircle className="w-5 h-5 text-red-500" /></div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by seller or vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.entries(statusLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead>Seller & Vehicle</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}><div className="h-16 bg-gray-100 rounded-lg animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No seller leads found</p>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{lead.user.name}</p>
                          <Badge variant="outline" className="text-[10px]">#{lead.id.slice(-6)}</Badge>
                        </div>
                        <p className="text-sm text-gray-500">{lead.make} {lead.model} {lead.variant}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                          <span>{lead.year}</span>
                          <span>-</span>
                          <span>{lead.kmDriven.toLocaleString()} km</span>
                          <span>-</span>
                          <span>{lead.vehicleNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-3 h-3 text-gray-400" />
                          <span>Expected: ₹{(lead.expectedPrice / 100000).toFixed(2)}L</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-3 h-3 text-primary" />
                          <span>{lead.photos.length} photos</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", statusColors[lead.status] || "")}>
                        {statusLabels[lead.status] || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="w-4 h-4 mr-2" /> Contact Seller
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {lead.status === "SUBMITTED" && (
                              <DropdownMenuItem onClick={() => handleApprove(lead)} className="text-green-600">
                                <CheckCircle className="w-4 h-4 mr-2" /> Schedule Inspection
                              </DropdownMenuItem>
                            )}
                            {lead.status === "INSPECTED" && (
                              <DropdownMenuItem onClick={() => handleApprove(lead)} className="text-green-600">
                                <DollarSign className="w-4 h-4 mr-2" /> Make Offer
                              </DropdownMenuItem>
                            )}
                            {!["ACQUIRED", "REJECTED"].includes(lead.status) && (
                              <DropdownMenuItem onClick={() => handleReject(lead)} className="text-red-600">
                                <XCircle className="w-4 h-4 mr-2" /> Reject
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Offer Dialog */}
      <Dialog open={isOfferDialogOpen} onOpenChange={setIsOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Make Offer</DialogTitle>
            <DialogDescription>
              Enter the offer amount for {selectedLead?.make} {selectedLead?.model} from {selectedLead?.user.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Offer Amount (₹)</Label>
              <Input
                type="number"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Expected: ₹{selectedLead?.expectedPrice.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsOfferDialogOpen(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary-dark text-white" onClick={submitOffer}>Send Offer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
