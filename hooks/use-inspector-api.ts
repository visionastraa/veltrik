"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

export interface InspectorStats {
  success: boolean
  todayCount: number
  completedCount: number
  inProgressCount: number
  pendingCount: number
  avgTime: number
  avgRating: number
  qualityScore: number
  recentInspections: InspectorInspection[]
}

export interface InspectorInspection {
  id: string
  sellerLead: {
    id: string
    make: string
    model: string
    variant: string
    vehicleNumber: string
    year: number
    kmDriven: number
    expectedPrice: number
    photos: string[]
    status: string
    user: { name: string; email: string }
  }
  inspector: { name: string; email: string }
  ageYears: number | null
  ageMonths: number | null
  kmDriven: number | null
  bodyDamage: string | null
  accidentHistory: string | null
  warrantyStatus: string | null
  batteryCharge: number | null
  batteryHealth: number | null
  batteryVoltage: number | null
  brakeSystem: string | null
  testDriveRating: number | null
  testDriveNotes: string | null
  finalOffer: number | null
  approvedAt: string | null
  inspectorId: string
  createdAt: string
  listing?: { id: string; title: string; price: number; status: string } | null
}

export interface InspectionFormData {
  ageYears?: number
  ageMonths?: number
  kmDriven?: number
  bodyDamage?: string
  bodyDamagePhoto?: string
  forkDamage?: boolean
  accidentHistory?: string
  warrantyStatus?: string
  warrantyType?: string
  warrantyExpiry?: string
  partsReplaced?: boolean
  replacedParts?: string
  adminComments?: string
  batteryCharge?: number
  batteryHealth?: number
  batteryVoltage?: number
  physicalDamage?: boolean
  brakeSystem?: string
  brakePads?: string
  wheelAlignment?: string
  testDriveRating?: number
  testDriveNotes?: string
  techComments?: string
}

// ---------- Inspector Stats ----------
export function useInspectorStats() {
  return useQuery<InspectorStats>({
    queryKey: ["inspector-stats"],
    queryFn: () => fetch("/api/inspector/stats").then((r) => r.json()),
  })
}

// ---------- Inspector Inspections (maps to /api/inspector/leads) ----------
export function useInspectorInspections() {
  return useQuery<{ success: boolean; data: InspectorInspection[] }>({
    queryKey: ["inspector-inspections"],
    queryFn: () => fetch("/api/inspector/leads").then((r) => r.json()),
  })
}

// ---------- Single Inspection ----------
export function useInspectorInspection(id: string) {
  return useQuery<{ success: boolean; data: InspectorInspection }>({
    queryKey: ["inspector-inspection", id],
    queryFn: () => fetch(`/api/inspector/leads/${id}`).then((r) => r.json()),
    enabled: !!id,
  })
}

// ---------- Submit Inspection ----------
export function useSubmitInspection() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { sellerLeadId: string; [key: string]: unknown }) =>
      fetch("/api/inspection/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspector-stats"] })
      qc.invalidateQueries({ queryKey: ["inspector-inspections"] })
    },
  })
}
