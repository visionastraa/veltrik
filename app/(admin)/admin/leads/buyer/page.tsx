"use client"

import { useState } from "react"
import {
  Search, MoreVertical, Eye, Phone, Mail, MessageCircle,
  Calendar, Users, CheckCircle, XCircle, Download, User,
  MapPin, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
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
import { useAdminBuyerLeads, type BuyerLeadData } from "@/hooks/use-admin-api"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

const statusColors: Record<string, string> = {
  LEAD_VISIT_SCHEDULED: "bg-blue-100 text-blue-600",
  FOLLOW_UP_REQUIRED: "bg-amber-100 text-amber-600",
  CONVERTED: "bg-green-100 text-green-600",
  LOST: "bg-red-100 text-red-600",
}

const statusLabels: Record<string, string> = {
  LEAD_VISIT_SCHEDULED: "Visit Scheduled",
  FOLLOW_UP_REQUIRED: "Follow-up Required",
  CONVERTED: "Converted",
  LOST: "Lost",
}

export default function BuyerCRMPage() {
  const { toast } = useToast()
  const { data, isLoading } = useAdminBuyerLeads()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [contactLead, setContactLead] = useState<BuyerLeadData | null>(null)

  const leads = (data?.data ?? []).filter((lead) => {
    const matchesSearch =
      !searchQuery ||
      lead.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const funnelData = [
    { label: "New Leads", value: leads.length, color: "bg-blue-500" },
    { label: "Visit Scheduled", value: leads.filter((l) => l.status === "LEAD_VISIT_SCHEDULED").length, color: "bg-amber-500" },
    { label: "Follow Up", value: leads.filter((l) => l.status === "FOLLOW_UP_REQUIRED").length, color: "bg-purple-500" },
    { label: "Converted", value: leads.filter((l) => l.status === "CONVERTED").length, color: "bg-green-500" },
    { label: "Lost", value: leads.filter((l) => l.status === "LOST").length, color: "bg-red-500" },
  ]

  const maxFunnel = Math.max(...funnelData.map((f) => f.value), 1)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Buyer CRM</h1>
          <p className="text-gray-500">Manage buyer relationships and pipeline</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      {/* Funnel */}
      <Card className="p-6 border-0 shadow-sm bg-white">
        <h3 className="font-semibold mb-4">Buyer Funnel</h3>
        <div className="space-y-3">
          {funnelData.map((stage) => (
            <div key={stage.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">{stage.label}</span>
                <span className="font-medium">{stage.value}</span>
              </div>
              <Progress
                value={maxFunnel > 0 ? (stage.value / maxFunnel) * 100 : 0}
                className={cn("h-2", stage.color)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
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
                <TableHead>Buyer</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><div className="h-16 bg-gray-100 rounded-lg animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12">
                    <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No buyer leads found</p>
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium">{lead.user.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Mail className="w-3 h-3" /> {lead.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        {lead.brandsInterested.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lead.brandsInterested.map((b) => (
                              <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
                            ))}
                          </div>
                        )}
                        {lead.modelsInterested.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {lead.modelsInterested.map((m) => (
                              <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("text-xs", statusColors[lead.status] || "")}>
                        {statusLabels[lead.status] || lead.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setContactLead(lead)}
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Calendar className="w-4 h-4 mr-2" /> Schedule Visit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setContactLead(lead)}>
                              <MessageCircle className="w-4 h-4 mr-2" /> Send Message
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-green-600">
                              <CheckCircle className="w-4 h-4 mr-2" /> Mark Converted
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <XCircle className="w-4 h-4 mr-2" /> Mark Lost
                            </DropdownMenuItem>
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

      {/* Contact Dialog */}
      <Dialog open={!!contactLead} onOpenChange={() => setContactLead(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Buyer</DialogTitle>
            <DialogDescription>
              {contactLead?.user.name} &bull; {contactLead?.user.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Message</Label>
              <Textarea
                placeholder={`Hi ${contactLead?.user.name}, I'm following up about your interest...`}
                className="mt-1.5"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Phone className="w-4 h-4 mr-2" /> Call
              </Button>
              <Button className="flex-1 bg-primary hover:bg-primary-dark text-white">
                <MessageCircle className="w-4 h-4 mr-2" /> Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
