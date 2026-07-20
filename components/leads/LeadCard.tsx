"use client"

import { User, Mail, Calendar, MoreVertical } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface LeadCardData {
  id: string
  name: string
  email: string
  status: string
  brands?: string[]
  models?: string[]
  createdAt: string
  expectedPrice?: number
  vehicleNumber?: string
}

interface LeadCardProps {
  lead: LeadCardData
  type: "buyer" | "seller"
  actions?: { label: string; value: string; variant?: "default" | "destructive" }[]
  onAction?: (action: string, leadId: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  LEAD_VISIT_SCHEDULED: "bg-blue-100 text-blue-600",
  FOLLOW_UP_REQUIRED: "bg-amber-100 text-amber-600",
  CONVERTED: "bg-green-100 text-green-600",
  LOST: "bg-red-100 text-red-600",
  SUBMITTED: "bg-purple-100 text-purple-600",
  SCHEDULED: "bg-blue-100 text-blue-600",
  INSPECTED: "bg-cyan-100 text-cyan-600",
  OFFER_MADE: "bg-amber-100 text-amber-600",
  ACQUIRED: "bg-green-100 text-green-600",
  REJECTED: "bg-red-100 text-red-600",
}

const STATUS_LABELS: Record<string, string> = {
  LEAD_VISIT_SCHEDULED: "Visit Scheduled",
  FOLLOW_UP_REQUIRED: "Follow-up Required",
  CONVERTED: "Converted",
  LOST: "Lost",
  SUBMITTED: "Submitted",
  SCHEDULED: "Scheduled",
  INSPECTED: "Inspected",
  OFFER_MADE: "Offer Made",
  ACQUIRED: "Acquired",
  REJECTED: "Rejected",
}

export function LeadCard({ lead, type, actions = [], onAction }: LeadCardProps) {
  return (
    <Card className="p-4 border-0 shadow-sm bg-white rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{lead.name}</h4>
              <Badge className={cn("text-[10px] px-1.5 py-0", STATUS_COLORS[lead.status] || "bg-gray-100 text-gray-600")}>
                {STATUS_LABELS[lead.status] || lead.status}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Mail className="w-3 h-3" />
              {lead.email}
            </div>
            {lead.brands && lead.brands.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {lead.brands.map((b) => (
                  <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
                ))}
              </div>
            )}
            {lead.expectedPrice != null && (
              <p className="text-xs text-gray-500 mt-1">
                Expected: ₹{(lead.expectedPrice / 100000).toFixed(2)}L
              </p>
            )}
            {lead.vehicleNumber && (
              <p className="text-xs text-gray-500 mt-0.5">
                Vehicle: {lead.vehicleNumber}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(lead.createdAt).toLocaleDateString()}
          </span>
          {actions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {actions.map((a, i) => (
                  <span key={a.value}>
                    {i > 0 && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      className={a.variant === "destructive" ? "text-red-600" : ""}
                      onClick={() => onAction?.(a.value, lead.id)}
                    >
                      {a.label}
                    </DropdownMenuItem>
                  </span>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </Card>
  )
}
