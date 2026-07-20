"use client"

import Link from "next/link"
import { Car, Battery, Star, User, Clock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface InspectionCardData {
  id: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  priority?: "high" | "medium" | "low"
  sellerName?: string
  vehicleName?: string
  batteryHealth?: number
  location?: string
  scheduledAt?: string
  score?: number
}

interface InspectionCardProps {
  inspection: InspectionCardData
  onStart?: (id: string) => void
  showActions?: boolean
}

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-600",
  in_progress: "bg-amber-100 text-amber-600",
  completed: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-600",
}

export function InspectionCard({ inspection, onStart, showActions = true }: InspectionCardProps) {
  return (
    <Card className="p-4 border-0 shadow-sm bg-white rounded-xl">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Car className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm truncate">{inspection.vehicleName || "Unknown Vehicle"}</h4>
              <Badge className={cn("text-[10px] px-1.5 py-0", STATUS_STYLES[inspection.status] || "")}>
                {inspection.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1 text-xs text-gray-500">
              {inspection.sellerName && (
                <span className="flex items-center gap-1"><User className="w-3 h-3" />{inspection.sellerName}</span>
              )}
              {inspection.location && (
                <span>{inspection.location}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {inspection.batteryHealth != null && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Battery</p>
              <div className="flex items-center gap-1">
                <Battery className="w-3 h-3 text-primary" />
                <span className="text-sm font-semibold">{Math.round(inspection.batteryHealth)}%</span>
              </div>
            </div>
          )}
          {inspection.score != null && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Score</p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500" />
                <span className="text-sm font-semibold">{inspection.score}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      {showActions && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          {inspection.scheduledAt && (
            <span className="text-xs text-gray-400 flex items-center gap-1 mr-auto">
              <Clock className="w-3 h-3" />
              {new Date(inspection.scheduledAt).toLocaleString()}
            </span>
          )}
          {inspection.status === "scheduled" && onStart && (
            <Button size="sm" className="h-7 text-xs" onClick={() => onStart(inspection.id)}>
              Start
            </Button>
          )}
          {inspection.status === "in_progress" && (
            <Link href={`/inspector/inspect/${inspection.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Continue
              </Button>
            </Link>
          )}
          {inspection.status === "completed" && (
            <Link href={`/inspector/inspect/${inspection.id}`}>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                View Report
              </Button>
            </Link>
          )}
        </div>
      )}
    </Card>
  )
}
