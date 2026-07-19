"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// ---------- Types ----------
export interface AdminStats {
  success: boolean
  totalLeads: number
  totalListings: number
  totalInspections: number
  totalRevenue: number
  recentActivity: {
    id: string
    action: string
    description: string
    createdAt: string
    type: string
  }[]
  recentListings: {
    id: string
    title: string
    price: number
    status: string
    createdAt: string
  }[]
}

export interface SellerLeadData {
  id: string
  userId: string
  user: { name: string; email: string }
  make: string
  model: string
  variant: string
  vehicleNumber: string
  year: number
  kmDriven: number
  expectedPrice: number
  description: string | null
  photos: string[]
  status: string
  scheduledAt: string | null
  createdAt: string
  updatedAt: string
}

export interface BuyerLeadData {
  id: string
  userId: string
  user: { name: string; email: string }
  listingId: string | null
  brandsInterested: string[]
  modelsInterested: string[]
  status: string
  createdAt: string
  updatedAt: string
}

export interface InspectionData {
  id: string
  sellerLeadId: string
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
    userId: string
  }
  inspector: { name: string; email: string }
  approvedBy: { name: string } | null
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

// ---------- Admin Stats ----------
export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => fetch("/api/admin/stats").then((r) => r.json()),
  })
}

// ---------- Seller Leads ----------
export function useAdminSellerLeads() {
  return useQuery<{ success: boolean; data: SellerLeadData[] }>({
    queryKey: ["admin-seller-leads"],
    queryFn: () => fetch("/api/admin/leads/seller").then((r) => r.json()),
  })
}

// ---------- Buyer Leads ----------
export function useAdminBuyerLeads() {
  return useQuery<{ success: boolean; data: BuyerLeadData[] }>({
    queryKey: ["admin-buyer-leads"],
    queryFn: () => fetch("/api/admin/leads/buyer").then((r) => r.json()),
  })
}

// ---------- Inspections ----------
export function useAdminInspection(id: string) {
  return useQuery<{ success: boolean; data: InspectionData }>({
    queryKey: ["admin-inspection", id],
    queryFn: () => fetch(`/api/admin/inspections/${id}`).then((r) => r.json()),
    enabled: !!id,
  })
}

// ---------- Approve ----------
export function useAdminApprove() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { inspectionId: string; offerPrice: number }) =>
      fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-stats"] })
      qc.invalidateQueries({ queryKey: ["admin-seller-leads"] })
      qc.invalidateQueries({ queryKey: ["vehicles"] })
    },
  })
}

// ---------- Reject ----------
export function useAdminReject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { sellerLeadId: string; reason?: string }) =>
      fetch("/api/admin/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-stats"] })
      qc.invalidateQueries({ queryKey: ["admin-seller-leads"] })
    },
  })
}
