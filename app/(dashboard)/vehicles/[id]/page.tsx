"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Battery, Gauge, Zap, Shield, Calendar, MapPin, Star, Clock, Phone, MessageCircle, Loader2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useVehicle, useToggleWishlist, useWishlist } from "@/hooks/use-api"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data, isLoading } = useVehicle(id)
  const { data: wishlistData } = useWishlist()
  const toggleWishlist = useToggleWishlist()
  const wishlistIds = useMemo(() => new Set(wishlistData?.data?.map(v => v.id) ?? []), [wishlistData])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-2xl" />
              <div className="space-y-4"><div className="h-8 bg-gray-200 rounded w-3/4" /><div className="h-6 bg-gray-200 rounded w-1/2" /><div className="h-32 bg-gray-200 rounded" /></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const vehicle = data?.data
  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Vehicle not found</h2>
        <p className="text-gray-500 mb-4">This vehicle may have been removed or is no longer available.</p>
        <Link href="/user"><Button className="bg-primary hover:bg-primary-dark text-white">Browse Vehicles</Button></Link>
      </div>
    )
  }

  const insp = vehicle.inspection
  const sl = insp?.sellerLead
  const batteryHealth = insp?.batteryHealth
  const kmDriven = insp?.kmDriven ?? sl?.kmDriven ?? 0
  const year = sl?.year ?? new Date(vehicle.createdAt).getFullYear()
  const isWishlisted = wishlistIds.has(vehicle.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
            <Home className="w-3 h-3" />
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/inventory" className="hover:text-primary transition-colors">Inventory</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{vehicle.title}</span>
        </div>

        <Link href="/inventory" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to listings
        </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
            {vehicle.photos?.[0] ? (
              <img src={vehicle.photos[0]} alt={vehicle.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><span className="text-6xl">EV</span></div>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {vehicle.status === 'AVAILABLE' && <Badge className="bg-primary text-white border-0 shadow-lg">Available</Badge>}
              {vehicle.status === 'RESERVED' && <Badge className="bg-amber-500 text-white border-0 shadow-lg">Reserved</Badge>}
              {vehicle.status === 'SOLD' && <Badge className="bg-gray-500 text-white border-0 shadow-lg">Sold</Badge>}
            </div>
            <button onClick={() => toggleWishlist.mutate(vehicle.id)} className="absolute top-4 right-4 p-3 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm">
              {toggleWishlist.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={cn("w-5 h-5", isWishlisted ? "fill-red-500 text-red-500" : "text-gray-600")} />}
            </button>
          </div>
          {vehicle.photos && vehicle.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {vehicle.photos.slice(0, 4).map((p, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{vehicle.title}</h1>
            {sl && <p className="text-gray-500 mt-1">{sl.year} {sl.make} {sl.model} {sl.variant}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-3xl font-bold text-primary">{(vehicle.price / 100000).toFixed(2)}L</span>
              {sl && <span className="text-sm text-gray-400">Expected: {(sl.expectedPrice / 100000).toFixed(2)}L</span>}
            </div>
          </div>

          {/* Key specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {batteryHealth != null && (
              <Card className="p-3 text-center"><Battery className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{Math.round(batteryHealth)}%</p><p className="text-xs text-gray-500">Battery</p></Card>
            )}
            <Card className="p-3 text-center"><Gauge className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{kmDriven.toLocaleString()}</p><p className="text-xs text-gray-500">Km Driven</p></Card>
            <Card className="p-3 text-center"><Calendar className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{year}</p><p className="text-xs text-gray-500">Year</p></Card>
            {insp?.testDriveRating && (
              <Card className="p-3 text-center"><Star className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-lg font-bold">{insp.testDriveRating}/10</p><p className="text-xs text-gray-500">Test Drive</p></Card>
            )}
          </div>

          {/* Inspection details */}
          {insp && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Inspection Report</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {insp.batteryCharge != null && <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Battery Charge</span><span className="font-medium">{Math.round(insp.batteryCharge)}%</span></div>}
                {insp.batteryVoltage != null && <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Battery Voltage</span><span className="font-medium">{insp.batteryVoltage}V</span></div>}
                {insp.bodyDamage && <div className="col-span-2 flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Body Damage</span><span className="font-medium">{insp.bodyDamage}</span></div>}
                {insp.accidentHistory && <div className="col-span-2 flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Accident History</span><span className="font-medium">{insp.accidentHistory}</span></div>}
                {insp.warrantyStatus && <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Warranty</span><span className="font-medium">{insp.warrantyStatus}</span></div>}
                {insp.testDriveNotes && <div className="col-span-2 p-2 bg-gray-50 rounded"><span className="text-gray-500">Test Drive Notes</span><p className="mt-1">{insp.testDriveNotes}</p></div>}
                {insp.finalOffer && <div className="col-span-2 flex justify-between p-2 bg-primary/5 rounded border border-primary/20"><span className="text-gray-500">Final Offer</span><span className="font-bold text-primary">{(insp.finalOffer / 100000).toFixed(2)}L</span></div>}
              </div>
            </Card>
          )}

          {/* Vehicle info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Vehicle Information</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {sl?.vehicleNumber && <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Registration</span><span className="font-medium">{sl.vehicleNumber}</span></div>}
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span className="text-gray-500">Status</span><span className="font-medium">{vehicle.status}</span></div>
              {sl?.description && <div className="col-span-2 p-2 bg-gray-50 rounded"><span className="text-gray-500">Description</span><p className="mt-1">{sl.description}</p></div>}
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1 bg-primary text-white h-12" asChild>
              <span><Phone className="w-4 h-4 mr-2" />Contact Seller</span>
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <span><MessageCircle className="w-4 h-4 mr-2" />Message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div>
  )
}
