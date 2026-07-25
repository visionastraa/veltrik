"use client"

import Link from "next/link"
import Image from "next/image"
import { Battery, Gauge, Star, Shield, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WishlistButton } from "@/components/ui/WishlistButton"
import { cn } from "@/lib/utils"

export interface VehicleCardProps {
  id: string
  title: string
  price: number
  photos?: string | string[]
  status?: "AVAILABLE" | "RESERVED" | "SOLD"
  batteryHealth?: number
  kmDriven?: number
  year?: number
  warrantyStatus?: string
  make?: string
  model?: string
  isWishlisted?: boolean
  onWishlistToggle?: () => void
  className?: string
}

export function VehicleCard({
  id,
  title,
  price,
  photos,
  status = "AVAILABLE",
  batteryHealth,
  kmDriven,
  year,
  warrantyStatus,
  isWishlisted = false,
  onWishlistToggle,
  className,
}: VehicleCardProps) {
  let parsedPhotos: string[] = []
  if (Array.isArray(photos)) {
    parsedPhotos = photos
  } else if (typeof photos === "string") {
    try {
      parsedPhotos = JSON.parse(photos)
    } catch {
      parsedPhotos = []
    }
  }

  const photoUrl = parsedPhotos[0] || "/api/placeholder/800/600?text=EV"
  const formattedPrice = `₹${(price / 100000).toFixed(2)} Lakh`

  return (
    <Card className={cn("group overflow-hidden rounded-2xl border border-gray-200/80 bg-white hover:shadow-xl transition-all duration-300 flex flex-col relative", className)}>
      {/* Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image
          src={photoUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {batteryHealth && (
            <Badge className="bg-emerald-500/90 text-white backdrop-blur-md font-semibold text-xs border-none">
              <Battery className="w-3.5 h-3.5 mr-1" />
              {batteryHealth}% Health
            </Badge>
          )}
          {warrantyStatus && warrantyStatus.toLowerCase().includes("warranty") && (
            <Badge className="bg-blue-500/90 text-white backdrop-blur-md font-semibold text-xs border-none">
              <Shield className="w-3 h-3 mr-1" />
              Warranty
            </Badge>
          )}
        </div>

        <div className="absolute top-3 right-3 z-10">
          <WishlistButton isWishlisted={isWishlisted} onToggle={onWishlistToggle ?? (() => {})} />
        </div>

        {/* Reserved / Sold Overlay */}
        {status === "RESERVED" && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="outline" className="border-amber-400 bg-amber-400/20 text-amber-300 font-bold px-4 py-1.5 text-sm uppercase tracking-wider">
              Reserved
            </Badge>
          </div>
        )}
        {status === "SOLD" && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="outline" className="border-red-500 bg-red-500/20 text-red-400 font-bold px-4 py-1.5 text-sm uppercase tracking-wider">
              Sold
            </Badge>
          </div>
        )}
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 font-medium">
            {year && <span>{year} Model</span>}
            {kmDriven !== undefined && (
              <span className="flex items-center">
                <Gauge className="w-3.5 h-3.5 mr-1 text-gray-400" />
                {kmDriven.toLocaleString()} km
              </span>
            )}
          </div>
        </div>

        {/* Price & CTA */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 font-medium block">Price</span>
            <span className="text-xl font-extrabold text-primary">{formattedPrice}</span>
          </div>

          <Link href={`/inventory/${id}`}>
            <Button size="sm" className="rounded-xl bg-gray-900 text-white hover:bg-primary transition-colors group/btn">
              Details
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover/btn:translate-x-0.5" />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
