"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

// ---------- Types ----------
export interface VehicleListing {
  id: string
  title: string
  price: number
  status: string
  photos: string[]
  publishedAt: string | null
  createdAt: string
  inspection: {
    id: string
    ageYears: number | null
    ageMonths: number | null
    kmDriven: number | null
    batteryHealth: number | null
    batteryCharge: number | null
    batteryVoltage: number | null
    bodyDamage: string | null
    accidentHistory: string | null
    warrantyStatus: string | null
    testDriveRating: number | null
    testDriveNotes: string | null
    finalOffer: number | null
    sellerLead: {
      id: string
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
      createdAt: string
      user: { id: string; name: string; phone: string | null }
    } | null
  }
}

export interface BookingData {
  id: string
  type: string
  scheduledAt: string
  status: string
  amount?: number
  listing?: VehicleListing
}

// ---------- Vehicles ----------
export function useVehicles(params?: {
  page?: number
  limit?: number
  search?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  minBatteryHealth?: number
  year?: number
  sortBy?: string
  status?: string
}) {
  const searchParams = new URLSearchParams()
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))
  if (params?.search) searchParams.set("search", params.search)
  if (params?.brand) searchParams.set("brand", params.brand)
  if (params?.minPrice) searchParams.set("minPrice", String(params.minPrice))
  if (params?.maxPrice) searchParams.set("maxPrice", String(params.maxPrice))
  if (params?.minBatteryHealth) searchParams.set("minBatteryHealth", String(params.minBatteryHealth))
  if (params?.year) searchParams.set("year", String(params.year))
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy)
  if (params?.status) searchParams.set("status", params.status)

  const qs = searchParams.toString()

  return useQuery<{
    success: boolean
    data: VehicleListing[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>({
    queryKey: ["vehicles", params],
    queryFn: () => fetch(`/api/vehicles?${qs}`).then(r => r.json()),
  })
}

export function useVehicle(id: string) {
  return useQuery<{ success: boolean; data: VehicleListing }>({
    queryKey: ["vehicle", id],
    queryFn: () => fetch(`/api/vehicles/${id}`).then(r => r.json()),
    enabled: !!id,
  })
}

// ---------- Wishlist ----------
export function useWishlist() {
  return useQuery<{ success: boolean; data: VehicleListing[] }>({
    queryKey: ["wishlist"],
    queryFn: () => fetch("/api/user/wishlist").then(r => r.json()),
  })
}

export function useToggleWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (vehicleId: string) =>
      fetch("/api/user/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wishlist"] }),
  })
}

// ---------- Bookings ----------
export function useBookings() {
  return useQuery<{ success: boolean; data: BookingData[] }>({
    queryKey: ["bookings"],
    queryFn: () => fetch("/api/user/bookings").then(r => r.json()),
  })
}

export function useCreateBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { listingId: string; buyerLeadId: string; scheduledAt: string }) =>
      fetch("/api/buyer/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  })
}

// ---------- Orders ----------
export function useOrders() {
  return useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["orders"],
    queryFn: () => fetch("/api/user/orders").then(r => r.json()),
  })
}

// ---------- Seller ----------
export function useSubmitSeller() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      make: string; model: string; variant: string; vehicleNumber: string
      year: number; kmDriven: number; expectedPrice: number
      description?: string; warrantyStatus?: string; photos: string[]
    }) =>
      fetch("/api/seller/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  })
}

// ---------- Buyer Lead ----------
export function useCreateBuyerLead() {
  return useMutation({
    mutationFn: (data: { listingId?: string; brandsInterested: string[]; modelsInterested: string[] }) =>
      fetch("/api/buyer/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(r => r.json()),
  })
}
