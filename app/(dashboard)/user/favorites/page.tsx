"use client"

import { useState } from "react"
import Link from "next/link"
import { Heart, Eye, Trash2, Search, Battery, Gauge, Loader2, ArrowLeft, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useWishlist, useToggleWishlist, type VehicleListing } from "@/hooks/use-api"
import { cn } from "@/lib/utils"

export default function FavoritesPage() {
  const [search, setSearch] = useState("")
  const { data, isLoading } = useWishlist()
  const toggleWishlist = useToggleWishlist()

  const vehicles = data?.data ?? []
  const filtered = vehicles.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/user">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/user" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home className="w-3 h-3" />
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Saved Vehicles</span>
            </div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-500" />
              Saved Vehicles
            </h1>
            <p className="text-gray-500">{vehicles.length} vehicles in your wishlist</p>
          </div>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search wishlist..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-64" />
          </div>
        </div>

        <div className="sm:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search wishlist..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-full" />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-2xl h-80" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">{vehicles.length === 0 ? 'No saved vehicles' : 'No results'}</h3>
            <p className="text-gray-500">{vehicles.length === 0 ? 'Start exploring EVs and save your favorites' : 'Try a different search term'}</p>
            {vehicles.length === 0 && <Link href="/user"><Button className="mt-4 bg-primary text-white">Browse EVs</Button></Link>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((vehicle) => {
              const insp = vehicle.inspection
              const sl = insp?.sellerLead
              const batteryHealth = insp?.batteryHealth
              const kmDriven = insp?.kmDriven ?? sl?.kmDriven ?? 0
              return (
                <Card key={vehicle.id} className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white rounded-2xl">
                  <Link href={`/vehicles/${vehicle.id}`}>
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                      {vehicle.photos?.[0] ? (
                        <img src={vehicle.photos[0]} alt={vehicle.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><Heart className="w-12 h-12" /></div>
                      )}
                      {vehicle.status === 'AVAILABLE' && <Badge className="absolute top-2 left-2 bg-primary text-white border-0 shadow-lg">Available</Badge>}
                    </div>
                  </Link>
                  <div className="p-4">
                    <Link href={`/vehicles/${vehicle.id}`}><h3 className="font-semibold text-sm hover:text-primary transition-colors">{vehicle.title}</h3></Link>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      {batteryHealth != null && <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-primary" />{Math.round(batteryHealth)}%</span>}
                      <span className="flex items-center gap-1"><Gauge className="w-3 h-3 text-primary" />{kmDriven.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-lg font-bold text-primary">{(vehicle.price / 100000).toFixed(2)}L</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/vehicles/${vehicle.id}`} className="flex-1"><Button className="w-full bg-primary hover:bg-primary-dark text-white" size="sm"><Eye className="w-4 h-4 mr-1" />View</Button></Link>
                      <Button variant="outline" size="sm" onClick={() => toggleWishlist.mutate(vehicle.id)} disabled={toggleWishlist.isPending} className="hover:bg-red-50 hover:border-red-200">
                        {toggleWishlist.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
