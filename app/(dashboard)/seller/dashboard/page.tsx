"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Car, Loader2, Plus, ArrowRight } from "lucide-react"
import type { SellerLead, Listing } from "@prisma/client"

type SellerLeadWithListing = SellerLead & { inspection?: { listing?: Listing } }

export default function SellerDashboardPage() {
  const { data: session } = useSession()
  const [leads, setLeads] = useState<SellerLeadWithListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/seller/leads')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLeads(data.leads)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const getStatusDisplay = (status: string, listingStatus?: string) => {
    if (listingStatus === 'PULLED') {
      return { label: "Your listing was temporarily removed. Our team will be in touch.", color: "bg-red-500/10 text-red-500" }
    }
    switch (status) {
      case 'SUBMITTED': return { label: "Submitted, awaiting review", color: "bg-blue-500/10 text-blue-500" }
      case 'SCHEDULED': return { label: "Inspection scheduled", color: "bg-indigo-500/10 text-indigo-500" }
      case 'INSPECTED': return { label: "Under review", color: "bg-amber-500/10 text-amber-500" }
      case 'OFFER_MADE': return { label: "Offer being prepared", color: "bg-orange-500/10 text-orange-500" }
      case 'ACQUIRED': return { label: "Listed on website", color: "bg-green-500/10 text-green-500" }
      case 'REJECTED': return { label: "Not selected", color: "bg-gray-500/10 text-gray-500" }
      default: return { label: status, color: "bg-gray-100 text-gray-600" }
    }
  }

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Vehicles</h1>
          <p className="text-muted-foreground">Manage your submitted vehicles and track their status.</p>
        </div>
        <Link href="/sell">
          <Button><Plus className="w-4 h-4 mr-2" /> Sell Another Vehicle</Button>
        </Link>
      </div>

      {leads.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <Car className="w-12 h-12 text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold mb-2">No vehicles submitted yet</h2>
          <p className="text-gray-500 mb-6">Start your selling journey by submitting your first vehicle.</p>
          <Link href="/sell"><Button>Get Started</Button></Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map(lead => {
            const display = getStatusDisplay(lead.status, lead.inspection?.listing?.status)
            
            // Handle double-stringified arrays since that was a bug before
            let photoUrl = ""
            if (lead.photos && lead.photos.length > 0) {
              try {
                let parsed: any = lead.photos
                while (typeof parsed === 'string') {
                  parsed = JSON.parse(parsed)
                }
                if (Array.isArray(parsed) && parsed.length > 0) {
                  photoUrl = parsed[0]
                }
              } catch (e) {}
            }

            return (
              <Card key={lead.id} className="overflow-hidden flex flex-col">
                <div className="aspect-[4/3] bg-gray-100 relative">
                  {photoUrl ? (
                    <img src={photoUrl} alt={`${lead.make} ${lead.model}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-12 h-12 text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge className={display.color} variant="outline">{display.label}</Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-lg">{lead.year} {lead.make} {lead.model}</h3>
                  <p className="text-sm text-gray-500 mb-4">{lead.variant} • {lead.kmDriven.toLocaleString()} km</p>
                  
                  <div className="mt-auto pt-4 border-t flex items-center justify-between">
                    <span className="font-medium">₹{lead.expectedPrice.toLocaleString()}</span>
                    {lead.status === 'ACQUIRED' && lead.inspection?.listing?.id && (
                      <Link href={`/inventory/${lead.inspection.listing.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark">
                          View Listing <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
